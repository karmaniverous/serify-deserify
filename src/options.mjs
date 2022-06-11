export default {
	serifyKey: null,
	types: {
		bigint: {
			serifier: (unserified) => unserified.toString(),
			deserifier: (serified) => BigInt(serified),
		},
		date: {
			serifier: (unserified) => unserified.getTime(),
			deserifier: (serified) => new Date(serified),
		},
		map: {
			serifier: (unserified) => [...unserified.entries()],
			deserifier: (serified) => new Map(serified),
		},
		set: {
			serifier: (unserified) => [...unserified.values()],
			deserifier: (serified) => new Set(serified),
		},
	},
};
