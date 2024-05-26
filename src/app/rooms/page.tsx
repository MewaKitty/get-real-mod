"use client";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, useRoom, useRoomList } from "../util/context";
import { RoomListItem } from "./RoomListItem";
import styles from "./rooms.module.scss";

export default function RoomsPage() {
	const room = useRoom();
	const router = useRouter();
	const auth = useAuth();
	const roomList = useRoomList();
	const [name, setName] = useState("");
	useEffect(() => {
		if (auth.name === null) router.replace("/setup");
		else if (room !== null) router.replace("/room");
	}, [room, router, auth]);
	const skeletons = [...Array(5)].map((_, i) => <RoomListItem room={null} key={i} canJoin={false} />)
	return <main>
		<h1>Rooms</h1>
		<section className={styles.roomList}>
			{
				roomList === undefined ? skeletons : roomList.filter(x => x.lateJoins ? x.state !== "end" : x.state === "lobby").map(x =>
					<RoomListItem room={x} key={x.name} canJoin={true} />
				)
			}
		</section>
		<section>
			<h1>Create Room</h1>
			<input value={name} onChange={e => setName(e.target.value)} />
			<button onClick={() => name.trim() && socket.emit("room:create", { name, unlisted: false }, () => {})}>Create</button>
		</section>
	</main>;
}
