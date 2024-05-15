import { Server } from "http"
import { Socket } from "socket.io"
import { TypedServer, TypedSocket } from "./types"
import { Card, constants, createDeck, isNormalCard, isNormalColorCard } from "../common/cards/card";
import { shuffle } from "../common/util/util";
import { PlayingRoom, Room, StartingRoom, roomManager } from "./room";
import { players } from "./auth";

export interface GameC2SEvents {

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
	currentCard: Card;
	currentColor: string;
	discardSize: number;
}

export interface Game {
	deck: Card[];
	nextPlayer: string;
	playerList: string[];
	currIndex: number;
	players: Record<
		string,
		{
			cards: Card[];
		}
	>;
	order: 1 | -1;
	currentCard: Card;
	currentColor: string;
	discard: Card[];
}

export const gameManager = {
	resendGame(room: StartingRoom | PlayingRoom) {
		for (const playerId of room.players) {
			players[playerId].socket.emit("game:data", this.createClientData(room.game))
		}
	},
	startGame(io: TypedServer, room: StartingRoom) {
		const players = shuffle(room.players);
		const deck = shuffle(createDeck());
		const startCardIndex = deck.findIndex(x => isNormalCard(x) && isNormalColorCard(x));
		const [startCard] = deck.splice(startCardIndex === -1 ? 0 : startCardIndex, 1);
		room.game = {
			currIndex: 0,
			deck,
			nextPlayer: players[1],
			playerList: players,
			players: Object.fromEntries(players.map(x => [x, { cards: [] }])),
			order: 1,
			currentCard: startCard,
			currentColor: isNormalColorCard(startCard) ? startCard.color as string : constants.colors[Math.floor(Math.random() * constants.colors.length)],
			discard: []
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
	createClientData(game: Game): ClientGameData {
		return {
			deckSize: game.deck.length,
			currentCard: game.currentCard,
			currIndex: game.currIndex,
			order: game.order,
			playerHands: Object.fromEntries(Object.entries(game.players).map(x => [x[0], x[1].cards.length])),
			currentColor: game.currentColor,
			playerList: game.playerList.map(x => players[x].name),
			discardSize: game.discard.length
		}
	}
}

export const registerGameEvents = (io: TypedServer, socket: TypedSocket) => {
	
}