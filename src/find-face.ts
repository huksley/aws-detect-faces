import { logger as log } from './logger'
import { config } from './config'
import { notify } from './workflow'
import { Rekognition, S3 } from 'aws-sdk'
import { urlToBucketName, urlToKeyName, passert, plog, decode } from './util'
import * as t from 'io-ts'
import { APIGatewayEvent as LambdaEvent, Context as LambdaContext } from 'aws-lambda'

export const InputPayload = t.type({
  s3Url: t.string,
  processId: t.union([t.string, t.undefined]),
  taskId: t.union([t.string, t.undefined]),
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
})

export const findFace = (r: Input, rekognition: Rekognition) => {
  log.info('Trying to recognise face', r)

  const mapResultToOutput = (res: Rekognition.DetectFacesResponse): Output => {
    return passert(res != null && res.FaceDetails && res.FaceDetails.length > 0, {
      ...r,
      ...(s => ({
        isSmiling: s.Value!,
        smilingConfidence: s.Confidence!,
      }))(res.FaceDetails![0].Smile || { Value: false, Confidence: 0 }),
    })
  }

  return s3
    .getObject({
      Bucket: urlToBucketName(r.s3Url),
      Key: urlToKeyName(r.s3Url) + '.face.json',
    })
    .promise()
    .then(data => {
      log.info('Using S3 cached data for', r)
      return mapResultToOutput(JSON.parse(data.Body!.toString('utf-8')))
    })
    .catch(err => {
      log.info('Not found in S3 cache, invoking Rekognition (' + err + ')', r)
      return rekognition
        .detectFaces({
          Image: {
            S3Object: {
              Bucket: urlToBucketName(r.s3Url),
              Name: urlToKeyName(r.s3Url),
            },
          },
          Attributes: ['ALL'],
        })
        .promise()
        .then(
          res =>
            s3
              .putObject({
                Bucket: urlToBucketName(r.s3Url),
                Key: urlToKeyName(r.s3Url) + '.face.json',
                Body: JSON.stringify(res),
                ContentType: 'application/json',
                ACL: 'public-read',
              })
              .promise() && plog('Rekognition result', res, mapResultToOutput(res)),
        )
    })
}

export const handler = (event: LambdaEvent, context: LambdaContext) =>
  findFace(decode<Input>(InputPayload, event.body), rek)
    .then(res => notify('SUCCESS', decode<Output>(OutputPayload, res)))
    .then(_ => context.done())
    .catch(err => notify('FAILED', err) && context.done(err, 500))
