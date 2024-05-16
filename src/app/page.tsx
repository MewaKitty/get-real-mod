"use client";
import { BackCard, Card } from "@/components/Card";
import { useEffect, useState } from "react";
import { ClientGameData } from "../../server/game";
import { ClientRoomData } from "../../server/room";
import { socket } from "../socket";
import styles from "./page.module.css";
import { getPlayerId, getPlayerName } from "./util/auth";
import { canMatch, canPlay } from "../../common/cards/card";

export default function Home() {
	const [room, setRoom] = useState<ClientRoomData | null>(null);
	const [game, setGame] = useState<ClientGameData | null>(null);
	const [name, setName] = useState<string>("");
	const [selected, setSelected] = useState<string[]>([]);
	useEffect(() => {
		socket.onAny(console.log);
		const id = getPlayerId();
		setName(getPlayerName());
		socket.emit("auth:id", id);
		socket.emit("auth:name", name, console.log);
		socket.on("room:data", x => {
			setRoom(x);
		});
		socket.on("game:data", d => {
			d.hand.sort((a, b) => {
				const first = a.color instanceof Array ? b.color instanceof Array ? 0 : -1 : b.color instanceof Array ? 1 : a.color.localeCompare(b.color);
				if (first !== 0) return first;
				return typeof a.type === "number" ? typeof b.type === "number" ? a.type - b.type : 1 : typeof b.type === "number" ? -1 : a.type.localeCompare(b.type)
			})

			setGame(d);
		});
	}, [name]);

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
					{name === game?.playerList[game.currIndex] && "ITS YOUR TURN!!"}
					{game?.pickup ? `+${game.pickup}!!` : ""}
					{game?.pickup && name === game?.playerList[game.currIndex] ? (
						<button style={{ marginLeft: "auto" }} onClick={() => socket.emit("game:pickup")}>
							Pickup
						</button>
					) : (
						""
					)}
					{game?.configurationState !== null && name === game?.playerList[game.currIndex] ? (
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
							style={{ backgroundColor: selected.includes(x.id) ? "black" : "" }}
							key={x.id}
							onClick={() => {
								if (name !== game?.playerList[game.currIndex] || !game.canPlay) return;
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
