/**
 * Test fixtures: a deeply nested value exercising every default type, and its
 * expected serified form. Pure.
 *
 * @module
 */

/**
 * Build a fresh deeply nested value containing every default type.
 *
 * @returns A `Map` keyed by a `bigint` & a `Date`, whose values contain
 * nested `Map`s, `Set`s and `undefined`.
 */
export const complexValue = (): Map<unknown, unknown> =>
  new Map<unknown, unknown>([
    [
      1234567890123456789012345678901234567890n,
      [
        new Map<unknown, unknown>([
          ['a', 1],
          [2, 'b'],
        ]),
        new Set(['a', 2]),
      ],
    ],
    [
      new Date('2000-01-02T03:04:05.678Z'),
      [
        new Set(['d', 5]),
        new Map<unknown, unknown>([
          ['d', 4],
          ['f', undefined],
        ]),
      ],
    ],
  ]);

/** The expected result of serifying {@link complexValue} with default options. */
export const complexSerified = {
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
          ],
        },
        { serifyKey: null, type: 'Set', value: ['a', 2] },
      ],
    ],
    [
      { serifyKey: null, type: 'Date', value: 946782245678 },
      [
        { serifyKey: null, type: 'Set', value: ['d', 5] },
        {
          serifyKey: null,
          type: 'Map',
          value: [
            ['d', 4],
            ['f', { serifyKey: null, type: 'Undefined', value: null }],
          ],
        },
      ],
    ],
  ],
};
