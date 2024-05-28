export const randomGaussian = (mean: number, stdDev: number) => {
	const u = 1 - Math.random();
	const v = Math.random();
	const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	return z * stdDev + mean;
};
