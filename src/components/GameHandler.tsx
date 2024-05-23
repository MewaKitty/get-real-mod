"use client";
import { getPlayerId, getPlayerName } from "@/app/util/auth";
import { AuthContext, GameContext, RoomContext } from "@/app/util/context";
import { socket } from "@/socket";
import { useEffect, useMemo, useState } from "react";
import { compareTypes, mapGroupBy } from "../../common/cards/card";
import { EnhancedClientGameData } from "../../server/game";
import { ClientRoomData } from "../../server/room";
import { useLocalStorage } from "@uidotdev/usehooks";

export const GameHandler = ({ children }: { children: React.ReactNode }) => {
	const [room, setRoom] = useState<ClientRoomData | null>(null);
	const [game, setGame] = useState<EnhancedClientGameData | null>(null);
	const [name, setName] = useLocalStorage<string | null>("playerName", null)
	const authData = useMemo(() => ({ name, setName }), [name, setName]);
	useEffect(() => {
		if (name !== null) socket.emit("auth:name", name, console.log);
	}, [name]);
	useEffect(() => {
		socket.onAny(console.log);
		const id = getPlayerId();
		setName(getPlayerName());
		socket.emit("auth:id", id);
		socket.on("room:data", x => {
			setRoom(x);
		});
		socket.on("game:data", d => {
			d.hand.sort((a, b) => {
				const first =
					a.color instanceof Array
						? b.color instanceof Array
							? a.color.join("").localeCompare(b.color.join(""))
							: -1
						: b.color instanceof Array
						? 1
						: a.color.localeCompare(b.color);
				if (first !== 0) return first;
				return compareTypes(a.type, b.type);
			});
			const count = [...mapGroupBy(d.hand, x => x.type)]
				.sort((a, b) => compareTypes(a[0], b[0]))
				.map(x => [x[0], x[1].length] as const)
				.filter(x => x[1] > 1)
				.map(x => x[0]);
			d.hand.sort((a, b) => (count.includes(a.type) ? (count.includes(b.type) ? count.indexOf(a.type) - count.indexOf(b.type) : -1) : count.includes(b.type) ? 1 : 0));
			setGame({
				...d,
				get yourTurn() {
					return name === game?.playerList[game.currIndex];
				},
			});
		});
	}, [game, name]);
	return (
		<RoomContext.Provider value={room}>
			<GameContext.Provider value={game}>
				<AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
			</GameContext.Provider>
		</RoomContext.Provider>
	);
};
