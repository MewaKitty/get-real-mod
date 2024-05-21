import { v4 } from "uuid";
import { Game } from "../../server/game";

export interface Card {
	type: string | number;
	color: string | string[];
}
export interface PlayedCard extends Card {
	id: string;
	colorOverride?: string;
}

export type CardType = number | `+${number}` | `×${number}` | "reverse" | "skip";

export const isNormalCard = (card: Card) => constants.numbers.includes(card.type as any);
export const isNormalColorCard = (card: Card) => constants.colors.includes(card.color as string);

export const constants = {
	colors: ["red", "blue", "yellow", "green", "orange", "purple"],
	wilds: [] as string[][],
	numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
	special: [
		{ type: "+2", variety: "normal", count: 2 },
		{ type: "skip", variety: "normal", count: 2 },
		{ type: "reverse", variety: "normal", count: 2 },
		{ type: "+4", variety: "wild", count: 4 },
		{ type: "+8", variety: "wild", count: 2 },
		{ type: "×2", variety: "wild", count: 4 },
	]
};
constants.wilds.push(constants.colors);
export const multicolor = constants.colors;
export const createDeck = () => {
	const deck: Card[] = [];
	for (const color of constants.colors) {
		for (const number of constants.numbers) {
			for (let i = 0; i < (number === 0 ? 1 : 2); i++) 
				deck.push({ type: number, color });
		}
		for (const special of constants.special) {
			if (special.variety === "normal" || special.variety === "both") for (let i = 0; i < special.count; i++) deck.push({ type: special.type, color });
		}
	}
	for (const wild of constants.wilds) {
		for (const number of constants.numbers) {
			for (let i = 0; i < 2; i++) deck.push({ type: number, color: wild });
		}
		for (const special of constants.special) {
			if (special.variety === "wild" || special.variety === "both") for (let i = 0; i < special.count; i++) deck.push({ type: special.type, color: wild });
		}
	}
	return [...Array(40)].fill(deck).flat();
};

export const createPlayingDeck = (): PlayedCard[] => createDeck().map(x => ({ ...x, id: v4() }))

export const canPlay = (current: Omit<PlayedCard, "id">, card: Card) => {
	if (current.color instanceof Array && current.colorOverride === undefined) {
		if (card.color instanceof Array) return card.color.some(x => current.color.includes(x));
		return current.color.includes(card.color);
	}
	const color = current.color instanceof Array ? current.colorOverride ?? current.color[0] : current.color;
	if (card.color instanceof Array) return card.color.includes(color);
	if (color === card.color) return true;
	if (current.type === card.type) return true;
	return false;
}

export const canMatch = (bottom: Card, top: Card) => {
	return bottom.type === top.type;
}

export const allMatch = (cards: Card[]) => {
	return cards.slice(1).map((x, i) => [cards[i], x]).every(x => canMatch(x[0], x[1]));
}

export const getPickupValue = (card: Card) => {
	if (typeof card.type !== "string") return null;
	if (card.type.startsWith("+")) return { type: "add", value: +card.type.slice(1) }
	if (card.type.startsWith("×")) return { type: "multiply", value: +card.type.slice(1) }
	return null;
}


export interface CardValue {
	type: "add" | "multiply"
}

export const modifyPickupValue = (initial: number, cards: Card[]) => {
	let value = initial;
	for (const card of cards) {
		const val = getPickupValue(card);
		if (val === null) return null;
		if (val.type === "add") value += val.value;
		if (val.type === "multiply") value *= val.value;
	}
	return value;
}

export const getInitialPickupValue = (nextPlayerId: string, game: Game, card: Card) => {
	const value = getPickupValue(card);
	if (value === null) return null;
	if (value.type === "multiply") return game.players[nextPlayerId].cards.length * (value.value - 1);
	if (value.type === "add") return value.value;
	return null;
}

export const getTotalPickupValue = (nextPlayerId: string, game: Game, cards: Card[]) => {
	let value = getInitialPickupValue(nextPlayerId, game, cards[0]);
	if (value === null) return null;
	return modifyPickupValue(value, cards.slice(1));
}