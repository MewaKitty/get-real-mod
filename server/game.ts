import { Server } from "http"
import { Socket } from "socket.io"
import { TypedServer, TypedSocket } from "./types"
import { allMatch, canMatch, canPlay, Card, constants, createDeck, createPlayingDeck, isNormalCard, isNormalColorCard, PlayedCard } from "../common/cards/card";
import { shuffle } from "../common/util/util";
import { PlayingRoom, Room, StartingRoom, roomManager } from "./room";
import { players } from "./auth";

export interface GameC2SEvents {
	"game:play": (cards: string[]) => void
}
export interface GameS2CEvents {
	"game:data": (data: ClientGameData) => void
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
}

export const gameManager = {
	resendGame(room: StartingRoom | PlayingRoom) {
		for (const playerId of room.players) {
			players[playerId].socket.emit("game:data", this.createClientData(room.game, playerId))
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
			pickedUp: false
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
			playerHands: Object.fromEntries(Object.entries(game.players).map(x => [x[0], x[1].cards.length])),
			playerList: game.playerList.map(x => players[x].name),
			lastDiscards: game.discard.slice(-10),
			hand: game.players[playerId].cards,
			canPlay: game.canPlay,
			pickedUp: game.pickedUp
		}
	},
	byPlayer(playerId: string) {
		const room = roomManager.byPlayer(playerId);
		if (room === undefined || room.state !== "play") return null;
		return room.game;
	}
}

export const registerGameEvents = (io: TypedServer, socket: TypedSocket) => {
	socket.on("game:play", cardIds => {
		const game = gameManager.byPlayer(socket.data.playerId);
		if (game === null) return;
		if (game.playerList[game.currIndex] !== socket.data.playerId) return;
		if (!game.canPlay) return;
		const cards = cardIds.map(x => game.players[socket.data.playerId].cards.find(y => y.id === x));
		if (cards.includes(undefined)) return;
		if (game.pickedUp) game.pickedUp = false;
		if (cards.length === 0) {
			game.canPlay = false;
			if (!game.pickedUp) {
				const [drawnCard] = game.deck.splice(0, 1);
				game.players[socket.data.playerId].cards.push(drawnCard);
				if (canPlay(game.currentCard, drawnCard)) {
					game.pickedUp = true;
					game.canPlay = true;
					gameManager.resendGame(game.room);
					return;
				}
			}
		} else {
			if (!allMatch(cards as Card[])) return;
			if (!canPlay(game.currentCard, cards[0]!)) return;
			game.canPlay = false;

			gameManager.resendGame(game.room);

			game.players[socket.data.playerId].cards = game.players[socket.data.playerId].cards.filter(x => !cardIds.includes(x.id));
			game.discard.push(game.currentCard, ...cards.slice(1) as PlayedCard[]);
			game.discard.splice(10, Infinity);
			game.currentCard = cards[0]!;
			if (!isNormalColorCard(game.currentCard)) game.currentCard.colorOverride = constants.colors[Math.floor(Math.random() * constants.colors.length)];
		}

		game.currIndex = game.playerList.indexOf(game.nextPlayer);
		game.nextPlayer = game.playerList[(game.currIndex + game.order + game.playerList.length) % game.playerList.length];

		game.canPlay = true;

		gameManager.resendGame(game.room);
	});
}