import styles from "./page.module.css";

const num = 10;
const angleRange = (Math.PI * 3) / 2;
export default function Home() {
	return (
		<main className={styles.main}>
			<section className={styles.container}>
				{[...Array(num)].map((_, i) => (
					<div
						className={styles.box}
						style={{
							backgroundColor: `#${(
								Math.floor(
									Math.abs(1000000 * Math.cos(i * 17 + 21))
								) % 0x1000000
							)
								.toString(16)
								.padStart(6, "0")}`,
							transform: `translateX(${
								45 *
								Math.cos(
									(angleRange / (num - 1)) * i -
										(angleRange - Math.PI) / 2
								)
							}vw) translateY(${
								-40 *
								Math.sin(
									(angleRange / (num - 1)) * i -
										(angleRange - Math.PI) / 2
								)
							}vh)`,
						}}
						key={i}
					></div>
				))}
			</section>
		</main>
	);
}
