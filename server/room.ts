import { Server } from "http"
import { Socket } from "socket.io"
import type { EventCallback, TypedServer, TypedSocket } from "./types"
import { gameManager, type Game } from "./game";
import { players } from "./auth";
import { shuffle } from "../common/util/util";
import { createDeck } from "../common/cards/card";

interface RoomCreateOptions {
	name: string;
	unlisted: boolean;
}
interface ClientRoomData {
	name: string
	owner: string
	players: string[]
	lateJoins: boolean
	state: Room["state"]
	max: number
}
export interface RoomC2SEvents {
	"room:create": (options: RoomCreateOptions, cb: EventCallback<boolean>) => void;
	"room:join": (roomName: string) => void;
	"room:start": () => void;

}
export interface RoomS2CEvents {
	"room:list": (rooms: {
		name: string;
		owner: string;
		playerCount: number;
		lateJoins: boolean;
		max: number;
		state: Room["state"];
	}[]) => void;
	"room:data": (room: {
		name: string;
		owner: string;
		players: string[];
		lateJoins: boolean;
		max: number;
		state: Room["state"];
	} | null) => void;
}

export interface BaseRoom {
	name: string;
	players: string[];
	owner: string;
	unlisted: boolean;
	max: number;
	lateJoins: boolean;
}
export interface LobbyRoom extends BaseRoom {
	state: "lobby";
}
export interface StartingRoom extends BaseRoom {
	state: "starting";
	game: Game;
}
export interface PlayingRoom extends BaseRoom {
	state: "play";
	game: Game;
}
export interface EndedRoom extends BaseRoom {
	state: "end";
	game: Game;
}
export type Room = LobbyRoom | StartingRoom | PlayingRoom | EndedRoom;

export const roomManager = {
	rooms: {} as Record<string, Room>,
	_roomPlayerCache: {} as Record<string, Room>,
	byPlayer(playerId: string) {
		return this._roomPlayerCache[playerId]
	},
	joinRoom(playerId: string, roomId: string) {
		const room = this.rooms[roomId];
		if (room === undefined || room.players.includes(playerId) || this.byPlayer(playerId) !== undefined) return;
		if (room.state === "end") return;
		if (room.state === "lobby" || room.lateJoins) {
			room.players.push(playerId);
			this._roomPlayerCache[playerId] = room;
			this.resendData(roomId);
			if (room.state !== "lobby") {
				room.game.players[playerId] = { cards: [...room.game.deck.splice(0, 10)] }
				room.game.playerList.push(playerId);
				// TODO resendGame
			}
		}
	},
	resendData(name: string) {
		const room = this.rooms[name];
		if (room === undefined) return;
		for (const playerId of room.players) {
			players[playerId].socket.emit("room:data", this.createClientData(room))
		}
	},
	createClientData(room: Room): ClientRoomData {
		return {
			name: room.name,
			owner: players[room.owner].name,
			players: room.players.map(x => players[x].name),
			lateJoins: room.lateJoins,
			state: room.state,
			max: room.max
		}
	},
	createListData(room: Room) {
		return {
			name: room.name,
			owner: players[room.owner].name,
			playerCount: room.players.length,
			lateJoins: room.lateJoins,
			state: room.state,
			max: room.max
		}
	},
	getPublicRooms() {
		return Object.values(this.rooms).filter(x => !x.unlisted)
	},
	sendPublicRooms(socket: TypedSocket) {
		socket.emit("room:list", roomManager.getPublicRooms().map(x => roomManager.createListData(x)));
	},
	createRoom(owner: string, options: RoomCreateOptions) {
		const room: Room = {
			owner,
			state: "lobby",
			lateJoins: false,
			max: 10,
			name: options.name,
			players: [owner],
			unlisted: options.unlisted
		}
		this._roomPlayerCache[owner] = room;
		this.rooms[room.name] = room;
		this.resendData(room.name);
	}
}

export const registerRoomEvents = (io: TypedServer, socket: TypedSocket) => {
	roomManager.sendPublicRooms(socket);
	socket.on("room:create", (args, cb) => {
		if (args.name in roomManager.rooms) return cb(false);
		roomManager.createRoom(socket.data.playerId, args);
		cb(true);
	});
	socket.on("room:join", room => {
		roomManager.joinRoom(socket.data.playerId, room);
	});
	socket.on("room:start", () => {
		const lobby = roomManager.byPlayer(socket.data.playerId);
		if (lobby === undefined || lobby.state !== "lobby") return;
		if (lobby.owner !== socket.data.playerId) return;
		const room = lobby as unknown as StartingRoom;
		room.state = "starting";
		roomManager.resendData(room.name);
		gameManager.startGame(io, room);
	});
}