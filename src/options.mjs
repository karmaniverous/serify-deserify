export default {
	serifyKey: null,
	types: {
		BigInt: {
			serifier: (unserified) => unserified.toString(),
			deserifier: (serified) => BigInt(serified),
		},
		Date: {
			serifier: (unserified) => unserified.getTime(),
			deserifier: (serified) => new Date(serified),
		},
		Map: {
			serifier: (unserified) => [...unserified.entries()],
			deserifier: (serified) => new Map(serified),
		},
		Set: {
			serifier: (unserified) => [...unserified.values()],
			deserifier: (serified) => new Set(serified),
		},
	},
};
