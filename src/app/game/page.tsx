"use client";
import { useRouter } from "next/navigation";
import { useGame, useRoom } from "../util/context";
import { useEffect, useState } from "react";
import styles from "./game.module.scss";
import { BackCard, EmptyCard } from "@/components/Card";

export default function GamePage() {
	const room = useRoom();
	const game = useGame();
	const router = useRouter();
	useEffect(() => {
		if (room === null) router.replace("/rooms");
		else if (room !== undefined && room.state !== "play") router.replace("/room");
	}, [room, router]);
	if (room === undefined || room === null || game === undefined || game === null) return <main className={styles.main}></main>;
	return (
		<main className={styles.main}>
			<div className={styles.table}>
				<div className={styles.deck} {...(game.yourTurn ? { "data-turn": true } : null)}>
					{[...Array(Math.ceil(Math.min(game.deckSize, 300) / 2))].map((_, i, a) => (
						<div className={styles.deckCard} key={i} style={{ "--deck-index": i, filter: a.length - 1 !== i ? `brightness(${Math.sin(Math.tan(i) + i)*0.1+0.82})` : "" }}>
							{
								a.length - 1 === i ? <BackCard height="12em" /> : <EmptyCard height="12em" />
							}
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
