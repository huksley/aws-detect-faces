import { Input, InputPayload, findFace } from './find-face'
import { decode } from './util'
import * as assert from 'assert'
import { Rekognition } from 'aws-sdk'
import { config } from './config'
import { logger as log } from './logger'

describe('check types', () => {
  it('input payload parseable', () => {
    decode<Input>(InputPayload, {
      s3Url: 's3://bucket-name/key-name.jpg',
    })
  })

  it('input payload string parseable', () => {
    decode<Input>(
      InputPayload,
      JSON.stringify({
        s3Url: 's3://bucket-name/key-name.jpg',
      }),
    )
  })

  it('input payload fail on errors', () => {
    try {
      decode<Input>(InputPayload, {})
    } catch (err) {
      assert.ok(err)
      log.info('Expected exception: ' + err.message)
    }
  })

  const e2e = config.TEST_RUN_E2E ? it : it.skip
  e2e('can detect at sample', () => {
    const res = findFace(
      {
        s3Url: `https://s3-${config.AWS_REGION}.amazonaws.com/${config.SAMPLE_BUCKET}/${
          config.SAMPLE_KEYPREFIX
        }.jpg`,
        processId: undefined,
        taskId: undefined,
      },
      new Rekognition({ region: config.AWS_REGION }),
    )
    return res.then(result => log.info('result', result))
  })
})
