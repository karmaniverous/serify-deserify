/* eslint-env mocha */

import { inspect } from 'util';

import chai from 'chai';
const should = chai.should();

import { serify, deserify } from '../src/index.mjs';

class Custom {
	constructor(p) {
		this.p = p;
	}
}

let customOptions;

beforeEach(() => {
	customOptions = {
		types: {
			Custom: {
				serifier: (u) => u.p,
				deserifier: (s) => new Custom(s),
			},
		},
	};
});

describe('serify', () => {
	describe('serializable', () => {
		it('undefined', () => {
			const v = undefined;

			const s = serify(v);

			should.equal(s, v);
		});

		it('null', () => {
			const v = null;

			const s = serify(v);

			should.equal(s, v);
		});

		it('bool', () => {
			const v = true;

			const s = serify(v);

			s.should.equal(v);
		});

		it('number', () => {
			const v = 42;

			const s = serify(v);

			s.should.equal(v);
		});

		it('string', () => {
			const v = 'tanstaafl';

			const s = serify(v);

			s.should.equal(v);
		});

		it('object', () => {
			const v = { a: 1, b: 2, c: 3 };

			const s = serify(v);

			s.should.deep.equal(v);
		});

		it('array', () => {
			const v = [true, 42, 'tanstaafl'];

			const s = serify(v);

			s.should.deep.equal(v);
		});

		it('complex', () => {
			const v = [
				true,
				42,
				'tanstaafl',
				{ a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
			];

			const s = serify(v);

			s.should.deep.equal(v);
		});
	});

	describe('unserializable', () => {
		it('bigint', () => {
			const v = 1234567890123456789012345678901234567890n;

			const s = serify(v);
			console.log(s);

			s.should.deep.equal({
				serifyKey: null,
				type: 'BigInt',
				value: '1234567890123456789012345678901234567890',
			});
		});

		it('date', () => {
			const v = new Date('2000-01-02 03:04:05.678');

			const s = serify(v);
			console.log(s);

			s.should.deep.equal({
				serifyKey: null,
				type: 'Date',
				value: 946753445678,
			});
		});

		it('map', () => {
			const v = new Map([
				['a', 1],
				[2, 'b'],
				['c', 3],
			]);

			const s = serify(v);
			console.log(s);

			s.should.deep.equal({
				serifyKey: null,
				type: 'Map',
				value: [
					['a', 1],
					[2, 'b'],
					['c', 3],
				],
			});
		});

		it('set', () => {
			const v = new Set(['a', 2, 'c']);

			const s = serify(v);
			console.log(s);

			s.should.deep.equal({
				serifyKey: null,
				type: 'Set',
				value: ['a', 2, 'c'],
			});
		});

		it('complex', () => {
			const v = new Map([
				[
					1234567890123456789012345678901234567890n,
					[
						new Map([
							['a', 1],
							[2, 'b'],
							['c', 3],
						]),
						new Set(['a', 2, 'c']),
					],
				],
				[
					new Date('2000-01-02 03:04:05.678'),
					[
						new Set(['d', 5, 'f']),
						new Map([
							['d', 4],
							[5, 'e'],
							['f', 6],
						]),
					],
				],
			]);

			const s = serify(v);

			s.should.be.deep.equal({
				serifyKey: null,
				type: 'Map',
				value: [
					[
						{
							serifyKey: null,
							type: 'BigInt',
							value: '1234567890123456789012345678901234567890',
						},
						[
							{
								serifyKey: null,
								type: 'Map',
								value: [
									['a', 1],
									[2, 'b'],
									['c', 3],
								],
							},
							{ serifyKey: null, type: 'Set', value: ['a', 2, 'c'] },
						],
					],
					[
						{ serifyKey: null, type: 'Date', value: 946753445678 },
						[
							{ serifyKey: null, type: 'Set', value: ['d', 5, 'f'] },
							{
								serifyKey: null,
								type: 'Map',
								value: [
									['d', 4],
									[5, 'e'],
									['f', 6],
								],
							},
						],
					],
				],
			});
		});

		it('custom', () => {
			const v = new Custom(42);

			const s = serify(v, customOptions);

			s.should.deep.equal({ serifyKey: null, type: 'Custom', value: 42 });
		});
	});

	describe('errors', () => {
		it('invalid serifier', () => {
			customOptions.types.Custom.serifier = 'tanstaafl';

			const v = new Custom(42);

			(() => serify(v, customOptions)).should.throw(
				Error,
				'invalid Custom serifier'
			);
		});
	});
});

describe('deserify', () => {
	describe('serializable', () => {
		it('undefined', () => {
			const v = undefined;

			const d = deserify(v);

			should.equal(d, v);
		});

		it('null', () => {
			const v = null;

			const d = deserify(v);

			should.equal(d, v);
		});

		it('bool', () => {
			const v = true;

			const d = deserify(v);

			d.should.equal(v);
		});

		it('number', () => {
			const v = 42;

			const d = deserify(v);

			d.should.equal(v);
		});

		it('string', () => {
			const v = 'tanstaafl';

			const d = deserify(v);

			d.should.equal(v);
		});

		it('object', () => {
			const v = { a: 1, b: 2, c: 3 };

			const d = deserify(v);

			d.should.deep.equal(v);
		});

		it('array', () => {
			const v = [true, 42, 'tanstaafl'];

			const d = deserify(v);

			d.should.deep.equal(v);
		});

		it('complex', () => {
			const v = [
				true,
				42,
				'tanstaafl',
				{ a: 1, b: 2, c: 3, d: [false, -42, '!tanstaafl'] },
			];

			const d = deserify(v);

			d.should.deep.equal(v);
		});
	});

	describe('unserializable', () => {
		it('bigint', () => {
			const v = {
				serifyKey: null,
				type: 'BigInt',
				value: '1234567890123456789012345678901234567890',
			};

			const d = deserify(v);

			inspect(d, false, null).should.equal(
				'1234567890123456789012345678901234567890n'
			);
		});

		it('date', () => {
			const v = { serifyKey: null, type: 'Date', value: 946753445678 };

			const d = deserify(v);

			inspect(d, false, null).should.equal('2000-01-01T19:04:05.678Z');
		});

		it('map', () => {
			const v = {
				serifyKey: null,
				type: 'Map',
				value: [
					['a', 1],
					[2, 'b'],
					['c', 3],
				],
			};

			const d = deserify(v);

			inspect(d, false, null).should.equal(
				`Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }`
			);
		});

		it('set', () => {
			const v = {
				serifyKey: null,
				type: 'Set',
				value: ['a', 2, 'c'],
			};

			const d = deserify(v);

			inspect(d, false, null).should.equal(`Set(3) { 'a', 2, 'c' }`);
		});

		it('complex', () => {
			const v = {
				serifyKey: null,
				type: 'Map',
				value: [
					[
						{
							serifyKey: null,
							type: 'BigInt',
							value: '1234567890123456789012345678901234567890',
						},
						[
							{
								serifyKey: null,
								type: 'Map',
								value: [
									['a', 1],
									[2, 'b'],
									['c', 3],
								],
							},
							{ serifyKey: null, type: 'Set', value: ['a', 2, 'c'] },
						],
					],
					[
						{ serifyKey: null, type: 'Date', value: 946753445678 },
						[
							{ serifyKey: null, type: 'Set', value: ['d', 5, 'f'] },
							{
								serifyKey: null,
								type: 'Map',
								value: [
									['d', 4],
									[5, 'e'],
									['f', 6],
								],
							},
						],
					],
				],
			};

			const d = deserify(v);

			inspect(d, false, null).should.equal(`Map(2) {
  1234567890123456789012345678901234567890n => [ Map(3) { 'a' => 1, 2 => 'b', 'c' => 3 }, Set(3) { 'a', 2, 'c' } ],
  2000-01-01T19:04:05.678Z => [ Set(3) { 'd', 5, 'f' }, Map(3) { 'd' => 4, 5 => 'e', 'f' => 6 } ]
}`);
		});

		it('custom', () => {
			const v = { serifyKey: null, type: 'Custom', value: 42 };

			const d = deserify(v, customOptions);

			d.p.should.equal(42);
		});

		it('unmatched serifyKey', () => {
			const v = { serifyKey: 42, type: 'Custom', value: 42 };

			const d = deserify(v, customOptions);

			d.should.deep.equal({ serifyKey: 42, type: 'Custom', value: 42 });
		});
	});

	describe('errors', () => {
		it('invalid serified object', () => {
			const v = { serifyKey: null };

			(() => deserify(v, customOptions)).should.throw(
				Error,
				'invalid serified object'
			);
		});

		it('unsupported type', () => {
			const v = { serifyKey: null, type: 'Unsupported', value: 42 };

			(() => deserify(v, customOptions)).should.throw(
				Error,
				'Unsupported is not a supported serify type'
			);
		});

		it('invalid deserifier', () => {
			customOptions.types.Custom.deserifier = 'tanstaafl';

			const v = { serifyKey: null, type: 'Custom', value: 42 };

			(() => deserify(v, customOptions)).should.throw(
				Error,
				'invalid Custom deserifier'
			);
		});
	});
});
