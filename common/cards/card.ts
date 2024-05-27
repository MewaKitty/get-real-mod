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

export type CardType = number | string | `+${number}` | `×${number}` | "reverse" | "skip";

export type GameConstants = {
	colors: string[];
	wilds: string[][];
	includeMulticolorWild: boolean;
	numbers: (number | string)[];
	special: { type: CardType; variety: "normal" | "wild" | "both"; count: number }[];
	amountPerNumber: number;
	amountPerWild: number;
	amountPerNumberOverride: { [key: number | string]: number };
	extra: (() => Card[]) | Card[];
	copies: number;
};

export const defaultConstants: GameConstants = {
	colors: ["red", "blue", "yellow", "green", "orange", "purple"],
	wilds: [],
	includeMulticolorWild: true,
	numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
	special: [
		{ type: "+2", variety: "normal", count: 2 },
		{ type: "skip", variety: "normal", count: 2 },
		{ type: "reverse", variety: "normal", count: 2 },
		{ type: "+4", variety: "wild", count: 4 },
		{ type: "+8", variety: "wild", count: 2 },
		{ type: "×2", variety: "wild", count: 4 },
	],
	amountPerNumber: 2,
	amountPerWild: 2,
	amountPerNumberOverride: { "0": 1 },
	extra: [],
	copies: 1,
} satisfies GameConstants;

export const originalConstants = {
	colors: ["red", "blue", "yellow", "green"],
	wilds: [],
	includeMulticolorWild: true,
	numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	special: [
		{ type: "+2", variety: "normal", count: 2 },
		{ type: "skip", variety: "normal", count: 2 },
		{ type: "reverse", variety: "normal", count: 2 },
		{ type: "+4", variety: "wild", count: 4 },
	],
	amountPerNumber: 2,
	amountPerWild: 0,
	amountPerNumberOverride: { "0": 1 },
	extra: (): Card[] => [...Array(8).fill({ type: " ", color: originalConstants.colors })],
	copies: 1,
} satisfies GameConstants;

export const cursedConstants = {
	colors: ["red", "orange", "yellow", "green", "blue", "purple", "#eee", "gray", "black", "#c5e386", "#c8d7f7", "teal"],
	wilds: [],
	includeMulticolorWild: true, // don't duplicate numbers
	numbers: ["θ", "Δ", -3, "π", "∞", "φ", "ψ", "Ω", "λ", "μ", "α", "Ω", "τ", "ξ", "ζ", "χ", "ω", "½", "א", "$", "÷"],
	amountPerNumber: 2,
	amountPerWild: 1,
	amountPerNumberOverride: { π: 4 },
	special: [
		{ type: "+2", variety: "both", count: 4 },
		{ type: "+4", variety: "both", count: 4 },
		{ type: "+8", variety: "both", count: 4 },
		{ type: "+16", variety: "both", count: 4 },
		{ type: "+32", variety: "both", count: 4 },
		{ type: "+64", variety: "both", count: 4 },
		{ type: "×2", variety: "both", count: 4 },
		{ type: "×4", variety: "both", count: 4 },
		{ type: "×8", variety: "both", count: 4 },
		{ type: "×1.5", variety: "both", count: 4 },
		{ type: "skip", variety: "both", count: 8 },
		{ type: "reverse", variety: "both", count: 8 },
		{ type: "💀", variety: "both", count: 1 },
	],
	copies: 1,
	extra: [{ color: "pink", type: "π" }, { color: "pink", type: "π" }, ...Array(4).fill({ color: ["blue", "#eee", "red"], type: "FR" })],
} satisfies GameConstants;
export const selectableRules = {
	normal: defaultConstants,
	original: originalConstants,
	cursed: cursedConstants,
} satisfies Record<string, GameConstants>;

export const createDeck = (constants: GameConstants): Card[] => {
	const deck: Card[] = [];
	for (const color of constants.colors) {
		for (const number of constants.numbers) {
			for (let i = 0; i < (constants.amountPerNumberOverride[number] ?? constants.amountPerNumber); i++) deck.push({ type: number, color });
		}
		for (const special of constants.special) {
			if (special.variety === "normal" || special.variety === "both") for (let i = 0; i < special.count; i++) deck.push({ type: special.type, color });
		}
	}
	for (const wild of [...constants.wilds, ...(constants.includeMulticolorWild ? [constants.colors] : [])]) {
		for (const number of constants.numbers) {
			for (let i = 0; i < constants.amountPerWild; i++) deck.push({ type: number, color: wild });
		}
		for (const special of constants.special) {
			if (special.variety === "wild" || special.variety === "both") for (let i = 0; i < special.count; i++) deck.push({ type: special.type, color: wild });
		}
	}
	deck.push(...structuredClone(constants.extra instanceof Function ? constants.extra() : constants.extra));
	return [...Array(constants.copies)].fill(deck).flat();
};

export const createPlayingDeck = (constants: GameConstants): PlayedCard[] => createDeck(constants).map(x => ({ ...x, id: v4() }));

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
};

export const canMatch = (bottom: Card, top: Card) => {
	return bottom.type === top.type;
};

export const allMatch = (cards: Card[]) => {
	return cards
		.slice(1)
		.map((x, i) => [cards[i], x])
		.every(x => canMatch(x[0], x[1]));
};

export const getPickupValue = (card: Card) => {
	if (typeof card.type !== "string") return null;
	if (card.type.startsWith("+")) return { type: "add", value: +card.type.slice(1) };
	if (card.type.startsWith("×")) return { type: "multiply", value: +card.type.slice(1) };
	return null;
};

export interface CardValue {
	type: "add" | "multiply";
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
};

export const getInitialPickupValue = (nextPlayerId: string, game: Game, card: Card) => {
	const value = getPickupValue(card);
	if (value === null) return null;
	if (value.type === "multiply") return game.players[nextPlayerId].cards.length * (value.value - 1);
	if (value.type === "add") return value.value;
	return null;
};

export const getTotalPickupValue = (nextPlayerId: string, game: Game, cards: Card[]) => {
	let value = getInitialPickupValue(nextPlayerId, game, cards[0]);
	if (value === null) return null;
	return modifyPickupValue(value, cards.slice(1));
};

export const compareTypes = (first: string | number, second: string | number) => {
	return typeof first === "number" ? (typeof second === "number" ? first - second : 1) : typeof second === "number" ? -1 : first.localeCompare(second);
};

export const mapGroupBy = <T, K>(array: T[], mapper: (value: T) => K) => {
	const map = new Map<K, T[]>();
	for (const value of array) {
		const k = mapper(value);
		if (!map.has(k)) map.set(k, []);
		map.get(k)!.push(value);
	}
	return map;
};
