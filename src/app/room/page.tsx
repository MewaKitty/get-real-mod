"use client";
import { useRouter } from "next/navigation";
import { useRoom } from "../util/context"
import { useEffect, useState } from "react";

export default function RoomPage() {
	const room = useRoom();
	const router = useRouter();
	useEffect(() => {
		if (room === null) router.replace("/rooms")
	}, [room, router]);
	return <main>
	</main>
}