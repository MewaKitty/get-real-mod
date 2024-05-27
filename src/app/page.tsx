"use client";
import { BackCard, Card } from "@/components/Card";
import { useEffect, useState } from "react";
import { canMatch, canPlay } from "../../common/cards/card";
import { socket } from "../socket";
import styles from "./page.module.css";
import { useGame, useRoom } from "./util/context";
import { useRouter } from "next/navigation";

export default function Home() {
	const room = useRoom();
	const game = useGame();
	const [selected, setSelected] = useState<string[]>([]);
	const router = useRouter();
	useEffect(() => {
		if (process.env.NODE_ENV !== "development") router.replace("/rooms");
	}, [router])
	return (
		<main className={styles.main}>
			<button
				onClick={() =>
					socket.emit(
						"room:create",
						{
							name: "test",
							unlisted: false,
						},
						console.log
					)
				}
			>
				Create
			</button>
			<button onClick={() => socket.emit("room:start")}>start</button>
			<button onClick={() => socket.emit("room:join", "test")}>join</button>
			<section style={{ display: "flex", flexDirection: "column" }}>
				Room State: {room?.state}
				<section style={{display: "flex"}}>
				<button onClick={() => socket.emit("game:play", [])}>
					<BackCard />
				</button>
				<div>
					{game?.playerList.map((x, i) => <div key={x}><span style={{ color: game.currIndex === i ? "green" : "black" }}>{x}</span>: {game.playerHands[x]} Card(s)</div>)}
				</div>
				</section>
				<section>
					Current{" "}
					<div style={{ position: "relative", marginLeft: "12rem" }}>
						{game?.lastDiscards.map((x, i, a) => (
							<div
								key={x.id}
								style={{
									position: "absolute",
									top: `calc(3rem * ${a.length - i} / ${a.length})`,
									left: `calc(-1.2rem * ${a.length - i})`,
									opacity: 0.5 + 0.5 * (i / a.length),
								}}
							>
								<Card symbol={x.type.toString()} color={x.color} colorOverride={x.colorOverride} />
							</div>
						))}
						{game?.currentCard && (
							<div style={{ zIndex: 2 }}>
								<Card
									key={game.currentCard.id}
									symbol={game.currentCard.type.toString()}
									color={game.currentCard.color}
									colorOverride={game.currentCard.colorOverride}
								/>
							</div>
						)}
						<div style={{ height: "3rem" }}></div>
					</div>
					{game?.yourTurn && "ITS YOUR TURN!!"}
					{game?.pickup ? `+${game.pickup}!!` : ""}
					{game?.pickup && game?.yourTurn ? (
						<button style={{ marginLeft: "auto" }} onClick={() => socket.emit("game:pickup")}>
							Pickup
						</button>
					) : (
						""
					)}
					{game?.configurationState !== null && game?.yourTurn ? (
						game.configurationState === "color" ? (
							<>
								<h1>Choose Color: </h1>
								{(game?.currentCard.color as string[]).map((x,i) => (
									<button key={x} style={{backgroundColor: x, height: "2rem", width: "2rem", margin: "0.1rem", borderWidth: "3px"}} onClick={() => socket.emit("game:configure", { type: "color", color: i })}></button>
								))}
							</>
						) : null
					) : (
						""
					)}
					{selected.length > 0 ? (
						<button
							onClick={() => {
								socket.emit("game:play", selected);
								setSelected([]);
							}}
						>
							Play Card(s)
						</button>
					) : (
						""
					)}
				</section>
				<section className={styles.hand}>
					{game?.hand.map(x => (
						<button
							style={selected.includes(x.id) ? {
								filter: "brightness(0.7) contrast(0.6)",
							} : {}}
							key={x.id}
							onClick={() => {
								if (!game.yourTurn || !game.canPlay) return;
								if (selected.includes(x.id)) {
									setSelected(
										selected.slice(
											0,
											selected.findIndex(y => y === x.id)
										)
									);
									return;
								}
								if (selected.length > 0) {
									if (canMatch(game.hand.find(y => y.id === selected.at(-1))!, x)) setSelected(selected.concat(x.id));
								} else if (canPlay(game.currentCard, x)) {
									if (game.hand.filter(y => x.id !== y.id).some(y => canMatch(x, y))) setSelected(selected.concat(x.id));
									else socket.emit("game:play", [x.id]);
								}
							}}
						>
							<Card symbol={x.type.toString()} color={x.color} key={x.id} />
						</button>
					))}
				</section>
			</section>
		</main>
	);
}
