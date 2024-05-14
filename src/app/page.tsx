"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { socket } from "../socket";
import { Card as TCard } from "@/cards/card";
import { Card } from "@/components/Card";

export default function Home() {
	const [temp, setTemp] = useState<TCard[]>([]);
	useEffect(() => {
		socket.onAny(console.log);
		socket.emit("init", "foo");
		socket.emit("name", "foo");
		socket.on("game:hand", hand => {
			setTemp(hand)
		})
	}, []);

	return (
		<main className={styles.main}>
		<button onClick={() => socket.emit("room:create", {
			name: "test",
			unlisted: false
		})}>Create</button>
		<button onClick={() => socket.emit("room:start", {
			name: "test"
		})}>Create</button>
		<section>
			{
				temp.map(x => <Card symbol={x.type.toString()} color={x.color} key={`${x.type}${x.color}`} />)
			}
		</section>
		</main>
	);
}
