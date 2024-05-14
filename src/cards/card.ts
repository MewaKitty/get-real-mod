export interface Card {
	type: string | number;
	color: string | string[];

}
export type CardType = number | `+${number}` | `×${number}` | "reverse" | "skip";

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
} as const;
export const createDeck = () => {
	const deck: Card[] = [];
	for (const color of constants.colors) {
		for (const number of constants.numbers) {
			for (let i = 0; i < (number === 0 ? 1 : 2); i++) 
				deck.push({ type: number, color });
		}
		for (const special of constants.special) {
			if (special.variety === "normal") for (let i = 0; i < special.count; i++) deck.push({ type: special.type, color });
		}
	}
	for (const wild of constants.wilds) {
		for (const number of constants.numbers) {
			deck.push({ type: number, color: wild });
		}
		for (const special of constants.special) {
			if (special.variety === "wild") for (let i = 0; i < special.count; i++) deck.push({ type: special.type, color: wild });
		}
	}
	return deck;
};

export const canPlay = (current: Card, color: string, card: Card) => {
	if (card.color instanceof Array) return card.color.includes(color);
	if (card.color === "multicolor") return true;
	if (color === card.color) return true;
	if (current.type === card.type) return true;
	return false;
}