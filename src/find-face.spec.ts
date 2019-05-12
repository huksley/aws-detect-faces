import { Input, InputPayload, findFace } from './find-face'
import { decode } from './util'
import * as assert from 'assert'
import { Rekognition } from 'aws-sdk'
import { config } from './config'
import { logger as log, logger } from './logger'
import fetch from 'node-fetch'

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

  const e2e = config.TEST_E2E ? it : it.skip
  e2e('can detect at sample', function() {
    this.timeout(10000)
    const res = findFace(
      {
        s3Url: config.E2E_IMAGE_URL,
      },
      new Rekognition({ region: config.AWS_REGION }),
    )
    return res.then(result => log.info('result', result))
  })

  const skip = config.API_DETECT_FACES_URL && config.TEST_E2E && config.E2E_IMAGE_URL ? it : it.skip
  skip('remotely invoke URL', () => {
    fetch(config.API_DETECT_FACES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        s3Url: config.E2E_IMAGE_URL,
      }),
    })
      .then(apiResponse => apiResponse.json())
      .then(facesResponse => {
        logger.warn('Detect faces result', facesResponse)
      })
      .catch(apiError => {
        logger.warn('Failed to detect faces', apiError)
      })
  })
})
