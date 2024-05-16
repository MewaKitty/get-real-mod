"use client";
import { Card } from "@/components/Card";
import styles from "./test.module.css";
import { useState } from "react";

const num = 10;
const angleRange = (Math.PI * 3) / 2;
export default function Home() {
	const [test, setTest] = useState(false);
	return (
		<main className={styles.test}>
			<section>
				<Card color="multicolor" symbol="8" colorOverride="blue" />
				<Card color="multicolor" symbol="12" colorOverride="green" />
				<Card color="multicolor" symbol="+4" colorOverride="red" />
				<Card color="multicolor" symbol="+2" colorOverride="yellow" />
				<Card color="multicolor" symbol="reverse" colorOverride="purple" />
				<Card color="multicolor" symbol="0" colorOverride="orange" />
				<Card color="multicolor" symbol="+4"/>
				<Card color="multicolor" symbol="6"  />
				<Card color="multicolor" symbol="4" colorOverride={test ? undefined : "blue"} />
				<button onClick={() => setTest(x => !x)}>{test.toString()}</button>
			</section>
			{["red", "blue", "yellow", "green", "orange", "purple",
				"multicolor", "#ddd", "black", "goldenrod", "brown", "pink", "#333", "cyan", 'url("https://food.fnr.sndimg.com/content/dam/images/food/fullset/2023/6/28/fresh-corn-on-the-cob-partially-shucked-on-dark-background.jpg.rend.hgtvcom.1280.1280.suffix/1687987003387.jpeg")',
				
			].map(c => (
				<section key={c}>
					{([...Array(22)]
						.map((x, i) => i) as (string | number)[])
						.concat("+2", /*..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", "💀", "FR", "🇫🇷"*/)
						.map((x) => (
							<Card key={x.toString()} color={c} symbol={x.toString()} />
						))}
				</section>
			))}
		</main>
	);
}
