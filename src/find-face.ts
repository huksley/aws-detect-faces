import { logger as log } from './logger'
import { config } from './config'
import { Rekognition, S3 } from 'aws-sdk'
import { urlToBucketName, urlToKeyName, passert, decode, toThrow } from './util'
import * as t from 'io-ts'
import { Context as LambdaContext, APIGatewayEvent, S3Event, Callback } from 'aws-lambda'
import { DetectFacesResult, IODetectFacesResult } from './rekognition'
import winston = require('winston')

export const InputPayload = t.type({
  s3Url: t.string,
})

export type Input = t.TypeOf<typeof InputPayload>

export const OutputPayload = t.intersection([
  InputPayload,
  t.type({
    isSmiling: t.boolean,
    smilingConfidence: t.number,
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
      }))(response.FaceDetails![0].Smile || { Value: false, Confidence: 0 }),
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
    .catch(err => {
      log.info('Not found in S3 cache, invoking Rekognition (' + err + ')', args)
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
            .then(s3save => log.info('Saved to S3', s3save))
            .catch(s3saveerr => {
              log.warn('Failed to save to S3', s3saveerr)
              throw toThrow(s3saveerr)
            })
        })
        .catch(rekerr => {
          log.warn('Failed rekognition', rekerr)
          throw toThrow(rekerr)
        })
    })
}

/** Invoked on API Gateway call */
export const postHandler = (event: APIGatewayEvent, context: LambdaContext, callback: Callback) => {
  winston.info(
    'event(' +
      typeof event +
      ') ' +
      JSON.stringify(event, null, 2) +
      ' context ' +
      JSON.stringify(context, null, 2),
  )
  findFace(
    decode<Input>(InputPayload, event.body !== undefined ? event.body : (event as any)),
    rek,
  ).then(result => callback(undefined, result))
}

/** Invoked on S3 event */
export const s3EventHandler = (event: S3Event, context: LambdaContext) => {
  Promise.all(
    event.Records.filter(r => r.s3.object.key.endsWith('.jpg')).map(r =>
      findFace(
        decode<Input>(InputPayload, {
          s3Url: 's3://' + r.s3.bucket.name + '/' + r.s3.object.key,
        }),
        rek,
      ),
    ),
  ).then(_ => context.done())
}
