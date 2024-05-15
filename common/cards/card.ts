import { v4 } from "uuid";

export interface Card {
	type: string | number;
	color: string | string[];
}
export interface PlayedCard extends Card {
	id: string;
	colorOverride?: string;
}

export type CardType = number | `+${number}` | `×${number}` | "reverse" | "skip";

export const isNormalCard = (card: Card) => constants.numbers.includes(card.type as number);
export const isNormalColorCard = (card: Card) => constants.colors.includes(card.color as string);

export const constants = {
	colors: ["red", "blue", "yellow", "green", "orange", "purple"],
	wilds: ["multicolor"],
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
			deck.push({ type: number, color: wild });
		}
		for (const special of constants.special) {
			if (special.variety === "wild" || special.variety === "both") for (let i = 0; i < special.count; i++) deck.push({ type: special.type, color: wild });
		}
	}
	return deck;
};

export const createPlayingDeck = (): PlayedCard[] => createDeck().map(x => ({ ...x, id: v4() }))

export const canPlay = (current: Omit<PlayedCard, "id">, card: Card) => {
	if (card.color instanceof Array) return card.color.includes(current.colorOverride ?? current.color[0]);
	if (card.color === "multicolor") return true;
	if ((current.colorOverride ?? current.color) === card.color) return true;
	if (current.type === card.type) return true;
	return false;
}

export const canMatch = (bottom: Card, top: Card) => {
	return bottom.type === top.type;
}

export const allMatch = (cards: Card[]) => {
	return cards.slice(1).map((x, i) => [cards[i - 1], x]).every(x => canMatch(x[0], x[1]));
}