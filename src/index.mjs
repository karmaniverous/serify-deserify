import kindOf from 'kind-of';

import defaultOptions from './options.mjs';

const serify_branch = (value, options) => {
	if (kindOf(value) !== 'string')
		for (const p in value) value[p] = serify_internal(value[p], options);
};

const serify_internal = (value, options) => {
	let serified = value;
	const valueType = kindOf(value);
	const serifyType = options.types[valueType];

	if (serifyType) {
		if (kindOf(serifyType.serifier) !== 'function')
			throw new Error(`invalid ${valueType} serifier`);

		serified = {
			serifyKey: options.serifyKey,
			type: valueType,
			value: serifyType.serifier(value),
		};

		serify_branch(serified.value, options);
	} else serify_branch(serified, options);

	return serified;
};

export const serify = (value, options = {}) =>
	serify_internal(value, { ...defaultOptions, ...options });

const deserify_internal = (value, options = {}) => {
	if (!value || kindOf(value) === 'string' || !Object.keys(value).length)
		return value;

	for (const p in value) value[p] = deserify_internal(value[p], options);

	if (value.serifyKey === options.serifyKey) {
		const serifyType = options.types[value.type];
		if (!serifyType)
			throw new Error(`${value.type} is not a supported serify type`);

		if (kindOf(serifyType.deserifier) !== 'function')
			throw new Error(`invalid ${value.type} deserifier`);

		return serifyType.deserifier(value.value);
	}

	return value;
};

export const deserify = (value, options = {}) =>
	deserify_internal(value, { ...defaultOptions, ...options });
