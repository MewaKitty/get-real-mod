"use client";
import { useRouter } from "next/navigation";
import { useAuth, useRoom } from "../util/context";
import { useEffect } from "react";

export default function RoomPage() {
	const room = useRoom();
	const router = useRouter();
	const auth = useAuth();
	useEffect(() => {
		if (auth.name === null) router.replace("/setup");
		else if (room === null) router.replace("/rooms");
	}, [room, router, auth]);
	return <main></main>;
}
