# AWS Detect faces

Fully typed, tested AWS Lambda code to detect faces using [AWS Rekognition](https://docs.aws.amazon.com/rekognition/)

  * Typescript
  * Unit and e2e tests
  * Configuration
  * Caches Rekognition responses in S3 along with the object
  * Deployment using [Serverless framework](https://serverless.com)
  * Connect to API Gateway and [S3 events](https://serverless.com/framework/docs/providers/aws/events/s3#setting-filter-rules)

## Installing && running

  * Create bucket
  * `> yarn`
  * `> yarn lint && yarn format && yarn test && yarn build`
  * IMAGE_BUCKET=my-image-bucket yarn deploy
  * Invoke Lambda via url (provide payload for example `{ "s3Url": "s3://bucket-name/image.jpg" }`)
  * Invoke Lambda by saving .jpg file to S3 bucket
  * Check CloudWatch logs for processing journal
  * Check S3 bucket for .face.json cached rekognition results

## Links

  * https://docs.aws.amazon.com/rekognition/
