/**
 * Package scope & name, parsed from the `npm_package_name` environment
 * variable set by npm scripts. Used by the Rollup config to name the IIFE
 * global. Reads `process.env` at import time.
 *
 * @module
 */

/** Matches an npm package name, capturing optional scope & bare name. */
const npmPackageRegex =
  /^(?:(?<packageScope>@[a-z0-9-~][a-z0-9-._~]*)\/)?(?<packageName>[a-z0-9-~][a-z0-9-._~]*)$/;

/** Parsed package scope & name; either may be `undefined`. */
interface PackageNameParts {
  /** Package scope including the leading `@`, e.g. `@karmaniverous`. */
  packageScope?: string;

  /** Bare package name, e.g. `serify-deserify`. */
  packageName?: string;
}

/**
 * Package scope & bare name, parsed from `npm_package_name`. Both are
 * `undefined` outside an npm script or if the name is invalid.
 */
export const { packageScope, packageName }: PackageNameParts =
  process.env.npm_package_name?.match(npmPackageRegex)?.groups ?? {};
