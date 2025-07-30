import tailwind from "@tailwindcss/postcss";
import cssnano from "cssnano";

const isProduction = process.env.NODE_ENV === "production";

export default {
	plugins: [
		tailwind,
		...(isProduction
			? [
					cssnano({
						preset: [
							"default",
							{
								discardComments: {
									removeAll: true,
								},
								normalizeWhitespace: true,
								mergeLonghand: true,
								mergeRules: true,
								discardUnused: true,
								minifySelectors: true,
								reduceIdents: false, // Keep CSS variables intact
								zindex: false, // Don't optimize z-index values
							},
						],
					}),
			  ]
			: []),
	],
};
