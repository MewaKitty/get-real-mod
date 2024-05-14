import styles from "./Card.module.scss";
import { icons } from "./icons";

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

const cardBackgroundForColor = (color: string | string[]) => {
	const real = typeof color === "string" && color in aliases ? aliases[color as keyof typeof aliases] : color;
	if (real instanceof Array && real.length > 1) {
		return `linear-gradient(${real.join(", ")})`;
	}
	return typeof real === "string" ? real : real[0];
};
const ringBackgroundForColor = (color: string | string[]) => {
	const real = typeof color === "string" && color in aliases ? aliases[color as keyof typeof aliases] : color;
	if (real instanceof Array && real.length > 1) {
		return `conic-gradient(${real.flatMap((x, i, a) => [`${x} ${(360 / a.length) * i}deg`, `${x} ${(360 / a.length) * (i + 1)}deg`]).join(", ")})`;
	}
	return typeof real === "string" ? real : real[0];
};

export const Card = ({
	color,
	symbol,
	size = sizeForSymbol(symbol),
	height = "100px",
}: {
	color: string | string[];
	symbol: string;
	size?: "normal" | "small" | "smaller" | "smallest";
	height?: string;
}) => {
	return (
		<article className={styles.cardWrapper} style={{ height }}>
			<div className={styles.card} style={{ background: cardBackgroundForColor(color) }} data-size={size}>
				{sideElementForSymbol(symbol)}
				{sideElementForSymbol(symbol, true)}
				{elementForSymbol(symbol)}
				<div className={styles.ring} style={{ background: ringBackgroundForColor(color) }}></div>
			</div>
		</article>
	);
};
