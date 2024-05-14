import { shuffle } from "./src/util/util";
import { Card, createDeck } from "./src/cards/card";
import { Server, Socket } from "socket.io";

const playerNames: Record<string, string> = {};
const rooms: Room[] = [];
export const handleConnect = (io: Server, socket: Socket) => {
	socket.on("init", (id, cb) => {
		socket.data.playerId = id;
	});
	socket.on("name", (name, cb) => {
		if (!socket.data.playerId) return;
		playerNames[socket.data.playerId] = name;
	});
	socket.on("room:list", (args, cb) => {
		if (!socket.data.playerId) return;
		cb(rooms.filter(x => !x.unlisted).map(x => x.name));
	});
	socket.on("room:create", (args, cb) => {
		if (!socket.data.playerId) return;
		rooms.push({
			name: args.name,
			players: [socket.data.playerId],
			owner: socket.data.playerId,
			unlisted: args.unlisted,
			state: "lobby",
			game: null as unknown as Game,
		});
		socket.join(`room/${args.name}`);
	});
	socket.on("room:join", (args, cb) => {
		if (!socket.data.playerId) return;
		const room = rooms.find(x => x.name === args.name);
		if (room === undefined) return;
		room.players.push(socket.data.playerId);
		socket.join(`room/${room.name}`);
		io.to(`room/${room.name}`).emit("room:update", {
			players: room.players.map(x => playerNames[x]),
		});
	});
	socket.on("room:start", (args, cb) => {
		if (!socket.data.playerId) return;
		const room = rooms.find(x => x.name === args.name);
		if (room === undefined) return;
		if (room.owner !== socket.data.playerId) return;
		room.state = "starting";
		const players = shuffle(room.players);
		const deck = shuffle(createDeck());
		room.game = {
			currIndex: 0,
			deck,
			nextPlayer: players[1],
			playerList: players,
			players: Object.fromEntries(players.map(x => [x, { name: playerNames[x], cards: [] }])),
			order: 1,
			currentCard: deck.shift()!,
		};
		io.to(`room/${room.name}`).emit("room:update", {
			state: "starting",
			playerList: room.game.playerList.map(x => playerNames[x]),
			deckSize: room.game.deck.length,
			currentCard: room.game.currentCard,
			order: room.game.order,
			currIndex: room.game.currIndex,
		});
		setTimeout(() => {
			for (const player of room.players) {
				room.game.players[player].cards.push(...room.game.deck.splice(0, 10));
				room.game.players[player].cards.sort((a, b) => 1); // TODO
				io.fetchSockets().then(x => x.find(y => y.data.playerId === player)?.emit("game:hand", room.game.players[player].cards));
			}
			io.to(`room/${room.name}`).emit(
				"game:hands",
				Object.entries(room.game.players).map(x => [x[1].name, x[1].cards.length])
			);
			room.state = "play";
			io.to(`room/${room.name}`).emit("room:update", {
				state: "play",
			});
		}, 1000);
	});
};

interface Room {
	name: string;
	players: string[];
	owner: string;
	state: RoomState;
	unlisted: boolean;
	game: Game;
}

type RoomState = "lobby" | "starting" | "play" | "end";

interface Game {
	deck: Card[];
	nextPlayer: string;
	playerList: string[];
	currIndex: number;
	players: Record<
		string,
		{
			name: string;
			cards: Card[];
		}
	>;
	order: 1 | -1;
	currentCard: Card;
}
