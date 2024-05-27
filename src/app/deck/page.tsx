"use client";
import { BackCard, Card } from "@/components/Card";
import styles from "./deck.module.scss";
import { createDeck, mapGroupBy, selectableRules } from "../../../common/cards/card";
import { useMemo } from "react";

export default function Deck() {
	const decks = useMemo(() => Object.entries(selectableRules).map(([name, rules]) => [name, mapGroupBy(createDeck(rules), x => x.color)] as const), []);
	return (
		<main className={styles.main}>
			{decks.map(([name, cards]) => (
				<section key={name}>
					<h1>{name} [{[...cards.values()].flat().length}]</h1>
					{[...cards.entries()].map(([color, values]) => (
						<section key={color.toString() + typeof color}>
							{values.map((card, i) => (
								<div key={i} className={styles.card}>
									<Card symbol={card.type.toString()} color={card.color} />
								</div>
							))}
						</section>
					))}
				</section>
			))}
		</main>
	);
}
