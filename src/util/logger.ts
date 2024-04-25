import { type ILogObj, Logger } from 'tslog';

import { packageName } from './packageName';

// These are the presefined tslog log levels. You can specify
// LOG_LEVEL by any of the keys or values defined below.
const logLevels: Record<string, number | undefined> = {
  silly: 0,
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  fatal: 6,
};

const integerLogLevel = parseInt(process.env.LOG_LEVEL ?? '');

const resolvedLogLevel = Number.isNaN(integerLogLevel)
  ? logLevels[(process.env.LOG_LEVEL ?? '').toLowerCase()]
  : integerLogLevel;

// Set your tslog instance options here! By default, logs are suppressed if LOG_LEVEL is invalid or undefined.
// See https://tslog.js.org for more info.
export const logger = new Logger<ILogObj>({
  hideLogPositionForProduction: true,
  minLevel: resolvedLogLevel,
  name: packageName,
  type: resolvedLogLevel === undefined ? 'hidden' : 'pretty',
});
