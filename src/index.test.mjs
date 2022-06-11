/* eslint-env mocha */

import { inspect } from 'util';

import chai from 'chai';
import chaiMatchPattern from 'chai-match-pattern';
chai.use(chaiMatchPattern);
chai.should();

import { serify, deserify } from './index.mjs';

describe('serify', () => {
	it('bigint', () => {
		const v = 1234567890123456789012345678901234567890n;

		const s = serify(v);
		console.log(s);

		s.should.deep.equal({
			serifyKey: null,
			type: 'bigint',
			value: '1234567890123456789012345678901234567890',
		});
	});

	it('date', () => {
		const v = new Date('2000-01-02 03:04:05.678');

		const s = serify(v);
		console.log(s);

		s.should.deep.equal({ serifyKey: null, type: 'date', value: 946753445678 });
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
			type: 'map',
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
			type: 'set',
			value: ['a', 2, 'c'],
		});
	});

	it('complex', () => {
		const v = new Map([
			[
				1234567890123456789012345678901234567890n,
				new Map([
					['a', 1],
					[2, 'b'],
					['c', 3],
				]),
			],
			[new Date('2000-01-02 03:04:05.678'), new Set(['a', 2, 'c'])],
		]);

		const s = serify(v);
		console.log(inspect(s, false, null));

		s.should.be.deep.equal({
			serifyKey: null,
			type: 'map',
			value: [
				[
					{
						serifyKey: null,
						type: 'bigint',
						value: '1234567890123456789012345678901234567890',
					},
					{
						serifyKey: null,
						type: 'map',
						value: [
							['a', 1],
							[2, 'b'],
							['c', 3],
						],
					},
				],
				[
					{ serifyKey: null, type: 'date', value: 946753445678 },
					{ serifyKey: null, type: 'set', value: ['a', 2, 'c'] },
				],
			],
		});
	});
});

describe('deserify', () => {
	it('bigint', () => {
		const v = {
			serifyKey: null,
			type: 'bigint',
			value: '1234567890123456789012345678901234567890',
		};

		const d = deserify(v);
		console.log(d);

		d.toString().should.equal('1234567890123456789012345678901234567890');
	});

	it('date', () => {
		const v = { serifyKey: null, type: 'date', value: 946753445678 };

		const d = deserify(v);
		console.log(d);

		d.getTime().should.equal(new Date('2000-01-02 03:04:05.678').getTime());
	});

	it('map', () => {
		const v = {
			serifyKey: null,
			type: 'map',
			value: [
				['a', 1],
				[2, 'b'],
				['c', 3],
			],
		};

		const d = deserify(v);
		console.log(d);

		[...d.entries()].should.deep.equal([
			['a', 1],
			[2, 'b'],
			['c', 3],
		]);
	});

	it('set', () => {
		const v = {
			serifyKey: null,
			type: 'set',
			value: ['a', 2, 'c'],
		};

		const d = deserify(v);
		console.log(d);

		[...d.values()].should.deep.equal(['a', 2, 'c']);
	});
});
