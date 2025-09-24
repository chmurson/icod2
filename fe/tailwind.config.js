/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			animation: {
				"spin-slow": "spin 20s linear infinite",
				"fade-in": "fadeIn 0.5s ease-in-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0", transform: "translateY(-8px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
	// Optimize for production builds
	corePlugins: {
		// Disable unused features to reduce bundle size
		backdropOpacity: false,
		backgroundOpacity: false,
		borderOpacity: false,
		divideOpacity: false,
		ringOpacity: false,
		textOpacity: false,
	},
	// Only include colors that are actually used
	safelist: [
		// Keep essential classes that might be used dynamically
		'text-red-500',
		'text-green-500',
		'text-blue-500',
		'bg-red-50',
		'bg-green-50',
		'bg-blue-50',
		// Keep animation classes
		'animate-spin',
		'animate-spin-slow',
	],
};
