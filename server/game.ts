import { Server } from "http";
import { Socket } from "socket.io";
import { TypedServer, TypedSocket } from "./types";
import {
	allMatch,
	canMatch,
	canPlay,
	Card,
	constants,
	createDeck,
	createPlayingDeck,
	getPickupValue,
	getTotalPickupValue,
	isNormalCard,
	isNormalColorCard,
	modifyPickupValue,
	multicolor,
	PlayedCard,
} from "../common/cards/card";
import { shuffle } from "../common/util/util";
import { PlayingRoom, Room, StartingRoom, roomManager } from "./room";
import { players } from "./auth";

export interface GameC2SEvents {
	"game:play": (cards: string[]) => void;
	"game:configure": (options: { type: "color"; color: number }) => void;
	"game:pickup": () => void;
}
export interface GameS2CEvents {
	"game:data": (data: ClientGameData) => void;
	"game:effect": (effect: "skip" | "reverse") => void;
	"game:pickup": (count: number) => void;
}

export interface ClientGameData {
	deckSize: number;
	playerList: string[];
	currIndex: number;
	order: 1 | -1;
	playerHands: Record<string, number>;
	currentCard: PlayedCard;
	lastDiscards: PlayedCard[];
	hand: PlayedCard[];
	canPlay: boolean;
	pickedUp: boolean;
	configurationState: null | "color";
	pickup: number;
}

export interface Game {
	deck: PlayedCard[];
	nextPlayer: string;
	playerList: string[];
	currIndex: number;
	players: Record<
		string,
		{
			cards: PlayedCard[];
		}
	>;
	order: 1 | -1;
	currentCard: PlayedCard;
	discard: PlayedCard[];
	canPlay: boolean;
	room: StartingRoom | PlayingRoom;
	pickedUp: boolean;
	configurationState: null | {
		type: "color";
		playedCards: PlayedCard[],
		card: PlayedCard
	};
	pickup: number;
	takeDeck(count: number): PlayedCard[];
	takeCard(): PlayedCard | null;
}

export const gameManager = {
	resendGame(room: StartingRoom | PlayingRoom) {
		for (const playerId of room.players) {
			players[playerId].socket.emit("game:data", this.createClientData(room.game, playerId));
		}
	},
	startGame(io: TypedServer, room: StartingRoom) {
		const players = shuffle(room.players);
		const deck = shuffle(createPlayingDeck());
		const startCardIndex = deck.findIndex(x => isNormalCard(x) && isNormalColorCard(x));
		const [startCard] = deck.splice(startCardIndex === -1 ? 0 : startCardIndex, 1);
		if (!isNormalColorCard(startCard)) startCard.colorOverride = constants.colors[Math.floor(Math.random() * constants.colors.length)];
		room.game = {
			currIndex: 0,
			deck,
			nextPlayer: players[1],
			playerList: players,
			players: Object.fromEntries(players.map(x => [x, { cards: [] }])),
			order: 1,
			currentCard: startCard,
			discard: [],
			canPlay: true,
			room,
			pickedUp: false,
			configurationState: null,
			pickup: 0,
			takeDeck(count: number) {
				const took = this.deck.splice(0, count);
				if (took.length < count) {
					const newDeck = shuffle(this.discard);
					for (const card of newDeck) delete card.colorOverride;
					this.discard = [];
					this.deck = newDeck;
					for (const card of this.deck.splice(0, count - took.length)) took.push(card);
				}
				return took;
			},
			takeCard() {
				const [card] = this.takeDeck(1);
				return card ?? null;
			},
		};
		for (const player of Object.values(room.game.players)) {
			player.cards.push(...deck.splice(0, 10));
		}
		gameManager.resendGame(room);
		setTimeout(() => {
			(room as unknown as PlayingRoom).state = "play";
			roomManager.resendData(room.name);
		}, 1000);
	},
	createClientData(game: Game, playerId: string): ClientGameData {
		return {
			deckSize: game.deck.length,
			currentCard: game.currentCard,
			currIndex: game.currIndex,
			order: game.order,
			playerHands: Object.fromEntries(Object.entries(game.players).map(x => [players[x[0]].name, x[1].cards.length])),
			playerList: game.playerList.map(x => players[x].name),
			lastDiscards: game.discard.slice(-10),
			hand: game.players[playerId].cards,
			canPlay: game.canPlay,
			pickedUp: game.pickedUp,
			configurationState: game.configurationState?.type ?? null,
			pickup: game.pickup,
		};
	},
	byPlayer(playerId: string) {
		const room = roomManager.byPlayer(playerId);
		if (room === undefined || room.state !== "play") return null;
		return room.game;
	},
	nextPlayer(cards: PlayedCard[], game: Game) {
		game.currIndex = game.playerList.indexOf(game.nextPlayer);
		game.nextPlayer = game.playerList[(game.currIndex + game.order + game.playerList.length) % game.playerList.length];

		game.canPlay = true;

		if (cards.length === 0) return;

		if (game.currentCard.type === "skip") {
			for (const _ of cards) {
				game.currIndex = game.playerList.indexOf(game.nextPlayer);
				game.nextPlayer = game.playerList[(game.currIndex + game.order + game.playerList.length) % game.playerList.length];
				players[game.nextPlayer].socket.emit("game:effect", "skip");
			}
		} else if (game.currentCard.type === "reverse") {
			for (const _ of cards) game.order *= -1;
			if (cards.length % 2 === 1) for (const player of game.playerList) players[player].socket.emit("game:effect", "reverse");
		}
		if (game.pickup !== 0) {
			game.pickup = modifyPickupValue(game.pickup, cards as Card[]) ?? game.pickup;
		} else {
			const pickup = getTotalPickupValue(game.nextPlayer, game, cards as Card[]);
			if (pickup !== null) {
				game.pickup = pickup;
			}
		}
	}
};

export const registerGameEvents = (io: TypedServer, socket: TypedSocket) => {
	socket.on("game:play", cardIds => {
		const game = gameManager.byPlayer(socket.data.playerId);
		if (game === null) return;
		if (game.playerList[game.currIndex] !== socket.data.playerId) return;
		if (!game.canPlay) return;
		const cards = cardIds.map(x => game.players[socket.data.playerId].cards.find(y => y.id === x));
		if (cards.includes(undefined)) return;
		if (cards.length === 0) {
			if (game.pickup !== 0) return;
			game.canPlay = false;
			if (!game.pickedUp) {
				const drawnCard = game.takeCard();
				if (drawnCard !== null) {
					game.players[socket.data.playerId].cards.push(drawnCard);
					if (canPlay(game.currentCard, drawnCard)) {
						game.pickedUp = true;
						game.canPlay = true;
						gameManager.resendGame(game.room);
						return;
					}
				}
			} else game.pickedUp = false;
		} else {
			if (!allMatch(cards as Card[])) return;
			if (!canPlay(game.currentCard, cards[0]!)) return;
			if (game.pickup !== 0 && getPickupValue(cards[0]!) === null) return;
			game.canPlay = false;

			gameManager.resendGame(game.room);

			game.players[socket.data.playerId].cards = game.players[socket.data.playerId].cards.filter(x => !cardIds.includes(x.id));
			game.discard.push(
				game.currentCard,
				...(cards
					.slice(0, -1)
					.map((x, i, a) =>
						x!.color instanceof Array
							? i === 0
								? { ...x, colorOverride: game.currentCard.colorOverride ?? game.currentCard.color }
								: { ...x, colorOverride: a[i - 1]?.colorOverride ?? a[i - 1]?.color }
							: x
					) as PlayedCard[])
			);
			game.currentCard = cards.at(-1)!;

			if (!isNormalColorCard(game.currentCard)) {
				game.configurationState = {
					type: "color",
					playedCards: cards as PlayedCard[],
					card: game.currentCard
				};
				gameManager.resendGame(game.room);
				return;
			};
		}

		gameManager.nextPlayer(cards as PlayedCard[], game);
		/*
		
		if (game.pickup !== 0 && !next.cards.some(x => canPlay(game.currentCard, x) && getPickupValue(x) !== null)) {
			for (const card of game.takeDeck(game.pickup)) next.cards.push(card);
			players[game.playerList[game.currIndex]].socket.emit("game:pickup", game.pickup);
			game.pickup = 0;
		}*/

		gameManager.resendGame(game.room);
	});

	socket.on("game:pickup", () => {
		const game = gameManager.byPlayer(socket.data.playerId);
		if (game === null) return;
		if (game.playerList[game.currIndex] !== socket.data.playerId) return;
		if (!game.canPlay) return;

		for (const card of game.takeDeck(game.pickup)) game.players[socket.data.playerId].cards.push(card);
		players[game.playerList[game.currIndex]].socket.emit("game:pickup", game.pickup);
		game.pickup = 0;
		gameManager.resendGame(game.room);
	});

	socket.on("game:configure", opts => {
		const game = gameManager.byPlayer(socket.data.playerId);
		if (game === null) return;
		if (game.playerList[game.currIndex] !== socket.data.playerId) return;
		if (game.configurationState === null) return;
		if (game.configurationState.type === "color" && opts.type === "color") {
			const colorIndex = opts.color;
			const chosen = game.configurationState.card.color[colorIndex];
			game.currentCard.colorOverride = chosen;
			gameManager.nextPlayer(game.configurationState.playedCards, game);
			game.configurationState = null;
			gameManager.resendGame(game.room);
		}
	})
};
