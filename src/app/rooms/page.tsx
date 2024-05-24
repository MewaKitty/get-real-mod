"use client";
import { useRouter } from "next/navigation";
import { useAuth, useRoom, useRoomList } from "../util/context";
import { useEffect } from "react";
import { RoomListItem } from "./RoomListItem";

export default function RoomPage() {
	const room = useRoom();
	const router = useRouter();
	const auth = useAuth();
	const roomList = useRoomList();
	useEffect(() => {
		if (auth.name === null) router.replace("/setup");
		else if (room !== null) router.replace("/room");
	}, [room, router, auth]);
	const skeletons = [...Array(5)].map((_, i) => <RoomListItem room={null} key={i} />)
	return <main>
		<section>
			{
				roomList === undefined ? skeletons : roomList.filter(x => x.lateJoins ? x.state !== "end" : x.state === "lobby").map(x =>
					<RoomListItem room={x} />
				)
			}
		</section>
	</main>;
}
