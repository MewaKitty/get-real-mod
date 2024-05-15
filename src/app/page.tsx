"use client";
import { v4 } from "uuid";
import { Card } from "@/components/Card";
import { useEffect, useState } from "react";
import { ClientGameData } from "../../server/game";
import { ClientRoomData } from "../../server/room";
import { socket } from "../socket";
import styles from "./page.module.css";

export default function Home() {
	const [room, setRoom] = useState<ClientRoomData | null>(null);
	const [game, setGame] = useState<ClientGameData | null>(null);
	useEffect(() => {
		socket.onAny(console.log);
		socket.emit("auth:id", v4())
		socket.emit("auth:name", v4(), console.log);
		socket.on("room:data", x => {
			setRoom(x);
		});
		socket.on("game:data", d => {
			setGame(d)
		})
	}, []);

	return (
		<main className={styles.main}>
		<button onClick={() => socket.emit("room:create", {
			name: "test",
			unlisted: false
		}, console.log)}>Create</button>
		<button onClick={() => socket.emit("room:start")}>start</button>
		<button onClick={() => socket.emit("room:join", "test")}>join</button>
		<section>
			Room State: {room?.state}
			{
				game?.hand.map(x => <Card symbol={x.type.toString()} color={x.color} key={`${x.type}${x.color}`} />)
			}
		</section>
		</main>
	);
}
