import { useState } from "react"
import { v4 } from "uuid";
import { useLocalStorage } from "@uidotdev/usehooks";

export const getPlayerId = () => {
	localStorage.playerId ??= v4();
	return localStorage.playerId;
}

export const usePlayerName = () => {
	return useLocalStorage("playerName", "");
}