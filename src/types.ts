/**
 * Core types & type guards shared by {@link serify} and {@link deserify}: the
 * {@link SerifiableTypeMap}, {@link SerifyOptions}, and the serified-value
 * shape. Pure; no side effects.
 *
 * @module
 */
import { isBoolean, isNull, isPlainObject, isString } from 'is-what';

/**
 * A mapping of serifiable type names to their types before & after
 * serification.
 *
 * @remarks
 * Each key is a type identifier (a class name, or the value of a class's
 * {@link serifyStaticTypeProperty} static property). Each value is a tuple of
 * the form `[UnserifiedType, SerifiedType]`.
 *
 * Extend this interface to describe your own custom types. See
 * {@link DefaultTypeMap} for an example.
 */
export type SerifiableTypeMap = Record<string, [unknown, unknown]>;

/**
 * A primitive value that is natively supported by `JSON.stringify` &
 * `JSON.parse`.
 *
 * @remarks
 * At runtime, only numbers that survive a JSON round trip exactly qualify:
 * `NaN`, `Infinity`, `-Infinity` & `-0` do not. {@link defaultOptions}
 * handles those as the `Number` type.
 */
export type SerializablePrimitive = boolean | number | null | string;

/**
 * Serializable primitive type guard.
 *
 * @param value - The value to test.
 * @returns `true` if `value` is `null`, a boolean, a string, or a finite
 * number other than `-0`, i.e. a primitive that survives a
 * `JSON.stringify`/`JSON.parse` round trip unchanged.
 */
export function isSerializablePrimitive(
  value: unknown,
): value is SerializablePrimitive {
  return (
    isBoolean(value) ||
    isNull(value) ||
    isString(value) ||
    (typeof value === 'number' &&
      Number.isFinite(value) &&
      !Object.is(value, -0))
  );
}

/**
 * A pair of serifier/deserifier callbacks for a given type.
 *
 * @typeParam T - The `[UnserifiedType, SerifiedType]` tuple of the target type.
 *
 * @remarks
 * The callbacks are declared with method syntax so that their parameters are
 * checked bivariantly. This lets a strongly-typed callback (e.g.
 * `(value: bigint) => string`) satisfy the `[unknown, unknown]` index
 * signature inherited from {@link SerifiableTypeMap} without resorting to
 * `any`.
 */
export interface SerifyOptionTypeCallbacks<T extends [unknown, unknown]> {
  /**
   * Converts an unserifiable value of the target type into a serifiable one.
   *
   * @param value - The unserified value.
   * @returns The serified value. May itself contain unserified values, which
   * will be serified recursively.
   */
  serifier(value: T[0]): T[1];

  /**
   * Converts a serified value back into the target type.
   *
   * @param value - The serified value, with its contents already deserified.
   * @returns The deserified value.
   */
  deserifier(value: T[1]): T[0];
}

/**
 * Options defining serifiable types and related callback functions.
 *
 * @typeParam M - The {@link SerifiableTypeMap} describing supported types.
 */
export interface SerifyOptions<M extends SerifiableTypeMap> {
  /**
   * Marker value written to every serified value. Change it to disambiguate
   * serified values from data that happens to share their shape.
   */
  serifyKey: SerializablePrimitive;

  /** Serifier/deserifier callbacks, keyed by type identifier. */
  types: { [T in keyof M]: SerifyOptionTypeCallbacks<M[T]> };
}

/**
 * The serializable form produced by {@link serify} for a value of a type
 * supported by {@link SerifyOptions}.
 *
 * @typeParam M - The {@link SerifiableTypeMap} describing supported types.
 */
export interface SerifiedValue<M extends SerifiableTypeMap> {
  /** The {@link SerifyOptions.serifyKey} in effect at serification. */
  serifyKey: SerifyOptions<M>['serifyKey'];

  /** The type identifier of the original value. */
  type: keyof M & string;

  /** The serified contents of the original value. */
  value: unknown;
}

/**
 * Serified value type guard. Used by {@link deserify} to recognise values
 * produced by {@link serify}.
 *
 * @param value - The value to test.
 * @param options - The {@link SerifyOptions} in effect.
 * @returns `true` if `value` has the shape of a {@link SerifiedValue} whose
 * `serifyKey` matches `options` and whose `type` is supported by `options`.
 */
export function isSerifiedValue<M extends SerifiableTypeMap>(
  value: unknown,
  options: SerifyOptions<M>,
): value is SerifiedValue<M> {
  return (
    isPlainObject(value) &&
    'serifyKey' in value &&
    value.serifyKey === options.serifyKey &&
    'type' in value &&
    isString(value.type) &&
    value.type in options.types &&
    'value' in value
  );
}

/**
 * Null-prototype object type guard.
 *
 * @param value - The value to test.
 * @returns `true` if `value` is an object with a `null` prototype.
 *
 * @example
 * ```ts
 * isNullObject(Object.create(null)); // true
 * isNullObject({}); // false
 * ```
 */
export function isNullObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === null
  );
}
