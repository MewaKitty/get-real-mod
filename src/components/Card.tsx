import { Roboto } from "next/font/google";
import styles from "./Card.module.scss";
import { icons } from "./icons";
import mix from "mix-css-color";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "900"] });

const sizeForSymbol = (symbol: string) => {
	if (symbol.length === 1) {
		if (/A-Z/.exec(symbol)) return "small";
		return "normal";
	}
	if (symbol.length === 2) return "smaller";
	if (symbol.length === 3) return "smallest";
	if (symbol.length >= 4) return "smallester";
};

const elementForSymbol = (symbol: string) => {
	if (symbol in icons) {
		const icon = icons[symbol as keyof typeof icons];
		if (icon.type === "both" || icon.type === "center")
			return (
				<div className={styles.bigIcon} style={{ "--icon-size": icon.size }}>
					{icon.element}
				</div>
			);
		else return null;
	}
	return <div className={styles.bigNumber}>{symbol}</div>;
};
const sideElementForSymbol = (symbol: string, flipped: boolean = false) => {
	if (symbol in icons) {
		const icon = icons[symbol as keyof typeof icons];
		if (icon.type === "both" || icon.type === "sides")
			return (
				<div className={styles.smallIcon} style={{ "--icon-size": icon.size }} {...(flipped ? { "data-flipped": true } : null)}>
					{icon.element}
				</div>
			);
	}
	return <div className={flipped ? styles.smallBottom : styles.smallTop}>{symbol}</div>;
};

const aliases = {
	multicolor: ["red", "blue", "yellow", "green", "orange", "purple"],
} as const;

const cardBackgroundForColor = (color: string | string[], colorOverride: string | undefined) => {
	const real = typeof color === "string" && color in aliases ? aliases[color as keyof typeof aliases] : color;
	if (real instanceof Array && real.length > 1) {
		return `linear-gradient(${real.join(", ")})`;
	}
	return typeof real === "string" ? real : real[0];
};
const ringBackgroundForColor = (color: string | string[], colorOverride: string | undefined) => {
	const real = typeof color === "string" && color in aliases ? aliases[color as keyof typeof aliases] : color;
	if (real instanceof Array && real.length > 1) {
		return `conic-gradient(${real.flatMap((x, i, a) => [`${x} ${(360 / a.length) * i}deg`, `${x} ${(360 / a.length) * (i + 1)}deg`]).join(", ")})`;
	}
	return (typeof real === "string" ? real : real[0]);
};

interface CardOptions {
	color: string | string[];
	symbol: string;
	flipped?: boolean;
	size?: "normal" | "small" | "smaller" | "smallest" | "smallester";
	height?: string;
	pinned?: boolean;
	colorOverride?: string;
}

const CardRing = ({ color, colorOverride }: { color: string | string[]; colorOverride: string | undefined }) => {
	console.log(`mixing `, color, colorOverride, mix("transparent", colorOverride ?? "", 50))
	return <div
		className={styles.ring}
		style={{
			background: ringBackgroundForColor(color, colorOverride),
			"--color-override": colorOverride ? mix("transparent", colorOverride, 50).hexa : ""
		}}
	></div>
}

export const Card = ({ color, symbol, flipped = false, size = sizeForSymbol(symbol), height = "100px", pinned = false, colorOverride }: CardOptions) => {
	console.log(`rendering `, color, symbol, colorOverride, color)
	return (
		<article
			className={`${roboto.className} ${styles.cardWrapper}`}
			style={{ height, ...(flipped && { transform: "rotateY(180deg)" }), ...(pinned && { top: 0, left: 0, position: "absolute" }) }}
		>
			<div
				className={styles.card}
				style={{
					background: cardBackgroundForColor(color, colorOverride),
					"--color-override": colorOverride ?? ""
				}}
				data-size={size}
				data-foo={JSON.stringify(colorOverride)}
			>
				{sideElementForSymbol(symbol)}
				{sideElementForSymbol(symbol, true)}
				{elementForSymbol(symbol)}
				<CardRing color={color} colorOverride={colorOverride} />
			</div>
		</article>
	);
};

export const BackCard = ({ height = "100px", flipped = false, pinned = false }: { height?: string; flipped?: boolean; pinned?: boolean }) => {
	return (
		<article
			className={`${roboto.className} ${styles.cardWrapper}`}
			style={{ height, ...(flipped && { transform: "rotateY(180deg)" }), ...(pinned && { top: 0, left: 0, position: "absolute" }) }}
		>
			<div className={styles.card} style={{ backgroundColor: "black" }} data-size="normal">
				<div className={styles.backIcon}>GET REAL</div>
				<div className={styles.ring} style={{ backgroundColor: "#3C5B6F", borderColor: "#3C5B6F" }}></div>
			</div>
		</article>
	);
};

export const DualCard = ({ height = "100px", flipped = false, color, symbol, size = sizeForSymbol(symbol) }: Omit<CardOptions, "pinned">) => {
	return (
		<article className={styles.dualCard} style={{ height }}>
			<BackCard height={height} pinned flipped={flipped} />
			<Card symbol={symbol} color={color} height={height} flipped={!flipped} size={size} pinned />
		</article>
	);
};
