export class Custom {
  constructor(p) {
    this.p = p;
  }
}

export const getCustomOptions = () => ({
  types: {
    Custom: {
      serifier: (u) => u.p,
      deserifier: (s) => new Custom(s),
    },
  },
});
