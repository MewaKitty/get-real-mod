import { createDeck } from "@/cards/card";
import { Card } from "@/components/Card";
import styles from "./test.module.css";

export default function Home() {
	const deck = createDeck();
	return (
		<main className={styles.test}>
			{[...Map.groupBy(deck, x => x.color).entries()].map(([k, v]) => (
				<section key={k.toString()}>
					{v?.map((y, i) => (
						<Card color={y.color} symbol={y.type.toString()} key={i} height="75px" />
					))}
				</section>
			))}
		</main>
	);
}
