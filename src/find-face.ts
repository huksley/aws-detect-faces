import { logger as log } from './logger'
import { config } from './config'
import { Rekognition, S3 } from 'aws-sdk'
import {
  urlToBucketName,
  urlToKeyName,
  passert,
  decode,
  toThrow,
  findPayload,
  apiResponse,
} from './util'
import * as t from 'io-ts'
import { Context as LambdaContext, APIGatewayEvent, Callback as LambdaCallback } from 'aws-lambda'
import { DetectFacesResult, IODetectFacesResult } from './rekognition'

export const InputPayload = t.type({
  s3Url: t.string,
})

export type Input = t.TypeOf<typeof InputPayload>

export const OutputPayload = t.intersection([
  InputPayload,
  t.type({
    isSmiling: t.boolean,
    smilingConfidence: t.number,
    faceRect: t.union([
      t.type({
        top: t.number,
        left: t.number,
        width: t.number,
        height: t.number,
      }),
      t.undefined,
    ]),
  }),
])

export type Output = t.TypeOf<typeof OutputPayload>

const rek = new Rekognition({
  region: config.AWS_REGION,
})

const s3 = new S3({
  region: config.AWS_REGION,
  signatureVersion: 'v4',
})

export const findFace = async (args: Input, rekognition: Rekognition) => {
  log.info('Trying to recognise face', args)

  const mapResultToOutput = (response: Rekognition.DetectFacesResponse) => {
    const result = decode<DetectFacesResult>(IODetectFacesResult, response)
    return passert(
      result.FaceDetails && result.FaceDetails.length > 0,
      (s => ({
        isSmiling: s.Value!,
        smilingConfidence: s.Confidence!,
        faceRect:
          result.FaceDetails![0].BoundingBox &&
          (b => ({
            left: b.Left!,
            top: b.Top!,
            width: b.Width!,
            height: b.Height!,
          }))(result.FaceDetails![0].BoundingBox),
      }))(result.FaceDetails![0].Smile || { Value: false, Confidence: 0 }),
    )
  }

  return s3
    .getObject({
      Bucket: urlToBucketName(args.s3Url),
      Key: urlToKeyName(args.s3Url) + '.face.json',
    })
    .promise()
    .then(data => {
      log.info('Using S3 cached data for', args)
      return mapResultToOutput(JSON.parse(data.Body!.toString('utf-8')))
    })
    .catch(s3Error => {
      log.info('Not found in S3 cache, invoking Rekognition (' + s3Error + ')', args)
      return rekognition
        .detectFaces({
          Image: {
            S3Object: {
              Bucket: urlToBucketName(args.s3Url),
              Name: urlToKeyName(args.s3Url),
            },
          },
          Attributes: ['ALL'],
        })
        .promise()
        .then(res => {
          log.info('Rekognition result', res)

          log.info(
            'Saving rekognition result as ' +
              urlToBucketName(args.s3Url) +
              '/' +
              urlToKeyName(args.s3Url) +
              '.face.json',
          )

          return s3
            .putObject({
              Bucket: urlToBucketName(args.s3Url),
              Key: urlToKeyName(args.s3Url) + '.face.json',
              Body: JSON.stringify(res),
              ContentType: 'application/json',
              ACL: 'public-read',
            })
            .promise()
            .then(s3Save => {
              log.info('Saved to S3', s3Save)
              return mapResultToOutput(res)
            })
            .catch(s3SaveError => {
              log.warn('Failed to save to S3', s3SaveError)
              throw toThrow(s3SaveError)
            })
        })
        .catch(rekognitionError => {
          log.warn('Failed rekognition', rekognitionError)
          throw toThrow(rekognitionError)
        })
    })
}

/** Invoked on API Gateway call */
export const postHandler = (
  event: APIGatewayEvent,
  context: LambdaContext,
  callback: LambdaCallback,
) => {
  log.info(
    'event(' +
      typeof event +
      ') ' +
      JSON.stringify(event, null, 2) +
      ' context ' +
      JSON.stringify(context, null, 2),
  )
  const payload = findPayload(event)
  try {
    return findFace(decode<Input>(InputPayload, payload), rek)
      .then(result => apiResponse(event, context, callback).success(result))
      .catch(failure =>
        apiResponse(event, context, callback).failure('Failed to find face: ' + failure),
      )
  } catch (error) {
    apiResponse(event, context, callback).failure('Failed to find face: ' + error)
  }
}
