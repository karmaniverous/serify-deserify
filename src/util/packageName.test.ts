import { afterEach, describe, expect, it, vi } from 'vitest';

describe('packageName', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([
    ['@karmaniverous/serify-deserify', '@karmaniverous', 'serify-deserify'],
    ['serify-deserify', undefined, 'serify-deserify'],
    ['Not A Package!', undefined, undefined],
  ])('parses %j', async (npmPackageName, scope, name) => {
    vi.stubEnv('npm_package_name', npmPackageName);

    const { packageScope, packageName } = await import('./packageName');

    expect(packageScope).toBe(scope);
    expect(packageName).toBe(name);
  });
});
