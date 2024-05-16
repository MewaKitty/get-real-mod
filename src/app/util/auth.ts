"use client";
import { useState } from "react"
import { v4 } from "uuid";
import { useLocalStorage } from "@uidotdev/usehooks";

export const getPlayerId = () => {
	localStorage.playerId ??= v4();
	return localStorage.playerId as string;
}

export const getPlayerName = () => {
	localStorage.playerName ??= v4();
	return localStorage.playerName as string;
}
