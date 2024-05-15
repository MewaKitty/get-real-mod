"use client";
import { v4 } from "uuid";
import { BackCard, Card } from "@/components/Card";
import { useEffect, useState } from "react";
import { ClientGameData } from "../../server/game";
import { ClientRoomData } from "../../server/room";
import { socket } from "../socket";
import styles from "./page.module.css";
import { getPlayerId, usePlayerName } from "./util/auth";

export default function Home() {
	const [room, setRoom] = useState<ClientRoomData | null>(null);
	const [game, setGame] = useState<ClientGameData | null>(null);
	const id = getPlayerId();
	const [name, setName] = usePlayerName();
	useEffect(() => {
		socket.onAny(console.log);
		socket.emit("auth:id", v4())
		socket.emit("auth:name", name, console.log);
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
			<section style={{display: "flex", flexDirection: "column"}}>
				Room State: {room?.state}
				<div onClick={() => socket.emit("game:play", [])}><BackCard /></div>
			<section>
				Current {game?.currentCard && <Card symbol={game.currentCard.type.toString()} color={game.currentCard.color} colorOverride={game.currentCard.colorOverride} />}
				{name === game?.playerList[game.currIndex] && "ITS YOUR TURN!!"}
			</section>
				<section className={styles.hand}>
				{
					game?.hand.map(x => <div onClick={() => socket.emit("game:play", [x.id])}>
						<Card symbol={x.type.toString()} color={x.color} key={x.id} />
						</div>)
				}
				</section>
			</section>
		</main>
	);
}
