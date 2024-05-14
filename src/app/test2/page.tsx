import { Card as TCard, createDeck } from "@/cards/card";
import { Card } from "@/components/Card";
import styles from "./test.module.css";

export default function Home() {
	const deck = createDeck();
	return (
		<main className={styles.test}>
			{[...(deck.reduce((l, c) => l.has(c.color) ? (l.get(c.color)!.push(c), l) : l.set(c.color, [c]), new Map<string | string[], TCard[]>())).entries()].map(([k, v]) => (
				<section key={k.toString()}>
					{v?.map((y, i) => (
						<Card color={y.color} symbol={y.type.toString()} key={i} height="75px" />
					))}
				</section>
			))}
		</main>
	);
}
