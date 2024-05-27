"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, useRoom } from "../util/context";

export default function SetupPage() {
	const room = useRoom();
	const router = useRouter();
	const [input, setInput] = useState("");
	const auth = useAuth();
	useEffect(() => {
		if (room !== undefined && room !== null) router.replace("/room")
	}, [room, router]);
	const submit = (value: string) => {
		if (room !== null && room !== undefined) return;
		auth.setName(value);
		router.push("/rooms")
	}
	return <main>
		<h1>
			Enter Name:
		</h1>
		<input value={input} onChange={e => setInput(e.target.value)}></input>
		<button onClick={() => input && submit(input)}>Submit</button>

	</main>
}