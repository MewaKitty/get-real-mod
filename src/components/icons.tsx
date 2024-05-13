
export const icons = {
	"+2": {
		type: "center",
		size: "45%",
		element: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fill="currentColor">
				<rect x="100" y="0" width="200" height="300" />
				<rect x="0" y="100" width="200" height="300" />
			</svg>
		),
	},
	"+4": {
		type: "center",
		size: "60%",
		element: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600" fill="currentColor">
				<rect x="300" y="0" width="200" height="300" />
				<rect x="200" y="100" width="200" height="300" />
				<rect x="100" y="200" width="200" height="300" />
				<rect x="0" y="300" width="200" height="300" />
			</svg>
		),
	},
	"+8": {
		type: "center",
		size: "70%",
		element: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" fill="currentColor">
				<rect x="300" y="0" width="200" height="300" />
				<rect x="200" y="100" width="200" height="300" />
				<rect x="100" y="200" width="200" height="300" />
				<rect x="0" y="300" width="200" height="300" />
				<rect x="500" y="100" width="200" height="300" />
				<rect x="400" y="200" width="200" height="300" />
				<rect x="300" y="300" width="200" height="300" />
				<rect x="200" y="400" width="200" height="300" />
			</svg>
		),
	},
	skip: {
		type: "both",
		size: "57%",
		element: (
			// From https://www.svgrepo.com/svg/24968/prohibited-sign
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 415.064 415.064" fill="currentColor">
				<g>
					<path
						d="M354.279,60.785C315.082,21.587,262.967,0,207.532,0C152.098,0,99.982,21.587,60.785,60.785
		C21.588,99.982,0,152.098,0,207.532c0,55.435,21.588,107.55,60.785,146.747c39.197,39.197,91.313,60.785,146.747,60.785
		c55.435,0,107.55-21.588,146.747-60.785c39.198-39.197,60.785-91.312,60.785-146.747
		C415.064,152.098,393.478,99.982,354.279,60.785z M207.532,339.918c-22.863,0-44.391-5.826-63.178-16.072l179.493-179.49
		c10.244,18.787,16.071,40.313,16.071,63.178C339.919,280.53,280.53,339.918,207.532,339.918z M207.532,75.145
		c22.862,0,44.392,5.827,63.178,16.073L91.219,270.711c-10.245-18.787-16.072-40.314-16.072-63.179
		C75.146,134.534,134.534,75.145,207.532,75.145z"
					/>
				</g>
			</svg>
		),
	},
	reverse: {
		type: "both",
		size: "57%",
		element: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" fill="currentColor">
				<path d="M 0 100 L 0 200 L 400 200 L 400 300 L 600 150 L 400 0 L 400 100 L 0 100 Z" />
				<path
					d="M 0 350 L 0 450 L 400 450 L 400 550 L 600 400 L 400 250 L 400 350 L 0 350 Z"
					transform="matrix(-1, 0, 0, -1, 600, 800)"
				/>
			</svg>
		),
	}
};
