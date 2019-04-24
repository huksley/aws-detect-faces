import * as dotenv from 'dotenv'
import * as R from 'ramda'
import 'source-map-support/register'

export const defaultConfig = {
  NODE_ENV: 'development' as 'development' | 'product',
  LOG_LEVEL: 'info' as 'info' | 'debug' | 'warn' | 'error',
  AWS_REGION: 'eu-west-1',
  /** Should run e2e tests, potentially inducing money? */
  TEST_RUN_E2E: false,
  SAMPLE_BUCKET: 'sample-bucket',
  SAMPLE_KEYPREFIX: 'test-assets/sample',
}

/** Converts specific keys to boolean */
const toBoolean = (o: typeof defaultConfig, k: string[]): typeof defaultConfig => {
  for (const kk of k) {
    o[kk] = typeof o[kk] === 'string' ? Boolean(o[kk]) : o[kk]
  }
  return o
}

/** Converts specific keys to number */
const toNumber = (o: typeof defaultConfig, k: string[]): typeof defaultConfig => {
  for (const kk of k) {
    o[kk] = typeof o[kk] === 'string' ? Number(o[kk]) : o[kk]
  }
  return o
}

/**
 * Typed, configurable instance of application config. Use environment or .env files to define variables.
 */
export const config = toNumber(
  toBoolean(
    {
      ...defaultConfig,
      ...(dotenv.config().parsed || R.pick(R.keys(defaultConfig), process.env)),
    },
    ['TEST_RUN_E2E'],
  ),
  [],
)
