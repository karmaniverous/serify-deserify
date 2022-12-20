// Let's create a custom class to send to our Redux store.
class Custom {
  constructor(p) {
    this.p = p;
  }
}

// Here's a serify options object that supports the new class.
const serifyOptions = {
  types: {
    Custom: {
      serifier: (u) => u.p,
      deserifier: (s) => new Custom(s),
    },
  },
};

// Generate a serify Redux middleware.
import { createReduxMiddleware, deserify } from '../src/export'; // '@karmaniverous/serify-deserify';
const serifyMiddleware = createReduxMiddleware(serifyOptions);

// Import Redux Toolkit.
// The import weirdness is only required to support Babel!
import * as toolkitRaw from '@reduxjs/toolkit';
const { combineReducers, configureStore, createSlice } =
  toolkitRaw.default ?? toolkitRaw;

// Construct a Redux slice.
const testSlice = createSlice({
  name: 'test',
  initialState: { value: null },
  reducers: {
    setValue: (state, { payload }) => {
      state.value = payload;
    },
  },
});

// Configure your Redux store.
const store = configureStore({
  reducer: combineReducers({
    test: testSlice.reducer,
  }),
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    // Add the serify middleware last, or Redux Toolkit's serializableCheck
    // will reject values before they are serified!
    serifyMiddleware,
  ],
});

// Get redux functions.
const { setValue } = testSlice.actions;
const { dispatch, getState } = store;

/* LET'S TRY IT OUT... */

// Put a BigInt into a Custom instance and store it in Redux.
const unserializable = new Custom(42n); // Normally Redux would choke on this!

// Try sending it to the store.
dispatch(setValue(unserializable)); // SUCCEEDS!

// Retrieve the value the store.
const {
  test: { value },
} = getState();

// The retrieved object is still serified.
console.log(value);
// {
//   serifyKey: null,
//   type: 'Custom',
//   value: { serifyKey: null, type: 'BigInt', value: '42' },
// };

// You could wrap a selector in deserify, but for now we'll just deserify
// the value explicitly.
const deserified = deserify(value, serifyOptions);

// What did we get?
console.log(deserified);
// Custom { p: 42n }
