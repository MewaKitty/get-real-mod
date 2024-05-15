import { Card as TCard, createDeck } from "../../../common/cards/card";
import { BackCard, Card, DualCard } from "@/components/Card";
import styles from "./test.module.css";

export default function Home() {
	const deck = createDeck();
	return (
		<main className={styles.test}>
			<section>
				<DualCard symbol="3" color="red" />
				<DualCard symbol="5" color="yellow" />
				<DualCard symbol="+2" color="orange" />
				<DualCard symbol="+8" color="multicolor" />
			</section>
			<section>
				<Card symbol="3" color="red" height="75px" />
				<BackCard height="75px" />
				<Card symbol="5" color="blue" height="75px" />
			</section>
			{[...deck.reduce((l, c) => (l.has(c.color) ? (l.get(c.color)!.push(c), l) : l.set(c.color, [c])), new Map<string | string[], TCard[]>()).entries()].map(([k, v]) => (
				<section key={k.toString()}>
					{v?.map((y, i) => (
						<Card color={y.color} symbol={y.type.toString()} key={i} height="75px" />
					))}
				</section>
			))}
		</main>
	);
}
