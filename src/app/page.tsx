"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { socket } from "../socket";
import { Card as TCard } from "../../common/cards/card";
import { Card } from "@/components/Card";

export default function Home() {
	const [temp, setTemp] = useState<TCard[]>([]);
	useEffect(() => {
		socket.onAny(console.log);
		socket.emit("auth:id", crypto.randomUUID())
		socket.emit("auth:name", crypto.randomUUID(), console.log)
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
			{
				temp.map(x => <Card symbol={x.type.toString()} color={x.color} key={`${x.type}${x.color}`} />)
			}
		</section>
		</main>
	);
}
