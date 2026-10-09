/**
 * Container traversal shared by {@link serify} and {@link deserify}: detects
 * arrays & plain objects and clones them with mapped contents. Pure.
 *
 * @module
 */
import { isArray, isPlainObject } from 'is-what';

/** A value whose contents {@link mapContainer} can traverse. */
export type Container = unknown[] | Record<string, unknown>;

/**
 * Container type guard.
 *
 * @param value - The value to test.
 * @returns `true` if `value` is an array or a plain object.
 */
export const isContainer = (value: unknown): value is Container =>
  isArray(value) || isPlainObject(value);

/**
 * Clone a container, mapping each of its elements (arrays) or own enumerable
 * string-keyed property values (plain objects).
 *
 * @param value - The container to clone. Never mutated.
 * @param map - Applied to each element or property value.
 * @returns A new array, or a new plain object with `Object.prototype` as its
 * prototype. Keys are defined as ordinary own properties, so a `__proto__`
 * key is preserved as data and inherited keys are excluded.
 */
export const mapContainer = (
  value: Container,
  map: (item: unknown) => unknown,
): Container =>
  isArray(value)
    ? value.map(map)
    : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, map(v)]));
