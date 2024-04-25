// Get package scope & name from package.json.

const npmPackageRegex =
  /^(?:(?<packageScope>@[a-z0-9-~][a-z0-9-._~]*)\/)?(?<packageName>[a-z0-9-~][a-z0-9-._~]*)$/;

export const { packageScope, packageName } =
  (process.env.npm_package_name?.match(npmPackageRegex)?.groups ?? {}) as {
    packageScope?: string;
    packageName?: string;
  };
