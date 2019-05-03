import * as assert from 'assert'
import * as fs from 'fs'
import { decode } from './util'
import { DetectFacesResult, IODetectFacesResult } from './rekognition'
import winston = require('winston')

describe('rekognition.ts', () => {
  it('can parse test-assets/rekognition-detectFaces-response.json', () => {
    const r = decode<DetectFacesResult>(
      IODetectFacesResult,
      fs.readFileSync('test-assets/rekognition-detectFaces-response.json').toString(),
    )
    assert.ok(r)
    assert.ok(r.FaceDetails)
    assert.ok(r.FaceDetails![0])
    assert.ok(r.FaceDetails![0].Smile)
    assert.ok(r.FaceDetails![0].Smile!.Value)
    // Check floats "almost" equals
    assert.ok(Math.abs(r.FaceDetails![0].Smile!.Confidence! - 99.98832702636719) < 0.00001)
    winston.info('Smiling confidence ' + r.FaceDetails![0].Smile!.Confidence)
  })
})
