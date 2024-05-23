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
		players[socket.data.playerId] = { name, socket };
		const room = roomManager.byPlayer(socket.data.playerId);
		roomManager.resendPlayerData(socket.data.playerId, room);
	});
	socket.once("auth:name", (name, cb) => {
		if (!socket.data.playerId) return;
        afterAuth(socket);
	});
}
export const registerAuthEvents = (io: TypedServer, afterAuth: (socket: TypedSocket) => void) => {
	io.on("connection", handleConnect(afterAuth))
}