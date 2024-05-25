import { Server } from "http"
import { Socket } from "socket.io"
import { EventCallback, TypedServer, TypedSocket } from "./types";
import { roomManager } from "./room";


export interface AuthC2SEvents {
	"auth:id": (id: string) => void;
	"auth:name": (name: string, cb: EventCallback<boolean>) => void;
}

export interface AuthS2CEvents {

}

export const players: Record<string, { socket: TypedSocket, name: string }> = {};

const handleConnect = (afterAuth: (socket: TypedSocket) => void) => (socket: TypedSocket) => {
	socket.once("auth:id", id => {
		socket.data.playerId = id;
	});
	socket.on("auth:name", (name, cb) => {
		if (!socket.data.playerId) return;
		players[socket.data.playerId] ??= { name, socket };
		players[socket.data.playerId].socket = socket;
		const room = roomManager.byPlayer(socket.data.playerId);
		if (players[socket.data.playerId].name !== name && room !== undefined)
			roomManager.resendData(room.name);
		if (room === undefined)
			players[socket.data.playerId].name = name;
		roomManager.resendPlayerData(socket.data.playerId, room);
		if (socket.data.authed === undefined) {
			socket.data.authed = true;
			afterAuth(socket);
		}
	});
}
export const registerAuthEvents = (io: TypedServer, afterAuth: (socket: TypedSocket) => void) => {
	io.on("connection", handleConnect(afterAuth))
}