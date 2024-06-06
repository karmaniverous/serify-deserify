import { isBoolean, isNull, isNumber, isPlainObject, isString } from 'is-what';

/**
 * A mapping of serifiable class names to their types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SerifiableTypeMap = Record<string, [any, any]>;

/**
 * A serializable primitive.
 */
type SerializablePrimitive = boolean | number | null | string;

/**
 * Serializable primitive type guard.
 */
export function isSerializablePrimitive(
  value: unknown,
): value is SerializablePrimitive {
  return (
    isBoolean(value) || isNumber(value) || isNull(value) || isString(value)
  );
}

/**
 * A function that converts an unserifiable value into a serifiable one, given
 * knowledge of the underlying type.
 */
type SerifierCallback<M extends SerifiableTypeMap, T extends M[keyof M]> = (
  value: T[0],
) => T[1];

/**
 * A function that converts an serifiable value into the original serifiable
 * one, given knowledge of the underlying type.
 */
type DeserifierCallback<M extends SerifiableTypeMap, T extends M[keyof M]> = (
  value: T[1],
) => T[0];

/**
 * A pair of serifier/deserifier callbacks for a given type.
 */
interface SerifyOptionTypeCallbacks<
  M extends SerifiableTypeMap,
  T extends M[keyof M],
> {
  serifier: SerifierCallback<M, T>;
  deserifier: DeserifierCallback<M, T>;
}

/**
 * Options defining serifiable types and related callback functions.
 */
export interface SerifyOptions<M extends SerifiableTypeMap> {
  serifyKey: SerializablePrimitive;
  types: { [T in keyof M]: SerifyOptionTypeCallbacks<M, M[T]> };
}

/**
 * A serified value.
 */
interface SerifiedValue<M extends SerifiableTypeMap> {
  serifyKey: SerifyOptions<M>['serifyKey'];
  type: keyof M;
  value: unknown;
}

/**
 * Serified value type guard.
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
    (value.type as string) in options.types &&
    'value' in value
  );
}
