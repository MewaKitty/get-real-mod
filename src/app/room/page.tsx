"use client";
import { useRouter } from "next/navigation";
import { useAuth, useRoom } from "../util/context";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { socket } from "@/socket";

export default function RoomPage() {
	const room = useRoom();
	const router = useRouter();
	const auth = useAuth();
	useEffect(() => {
		if (room === null) router.replace("/rooms");
		else if (room !== undefined && (room.state === "play" || room.state === "starting" || room.state === "end")) router.replace("/game");
	}, [room, router]);
	const onClickStart = () => {
		socket.emit("room:start");
	}
	const onClickLeave = () => {
		socket.emit("room:leave");
	}

	return <main>
		<h1>{room ? `Room: ${room.name}` : <Skeleton />}</h1>
		<h1>Players</h1>
		<ul>
			{room ? room.players.map(x => <li key={x}>{x}</li>) : <Skeleton count={4} />}
		</ul>
		{room?.owner === auth.name ? <button onClick={onClickStart}>Start</button> : ""}
		<button onClick={onClickLeave}>Leave</button>
	</main>;
}
