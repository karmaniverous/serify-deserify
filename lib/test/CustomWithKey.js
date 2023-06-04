import { serifyKey } from '../serify/serify.js';

export class CustomWithKey {
  static [serifyKey] = 'AlternateKey';

  constructor(p) {
    this.p = p;
  }
}

export const getCustomWithKeyOptions = () => ({
  types: {
    AlternateKey: {
      serifier: (u) => u.p,
      deserifier: (s) => new CustomWithKey(s),
    },
  },
});
