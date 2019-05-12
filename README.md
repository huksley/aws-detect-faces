# AWS Detect faces

[![Sponsored](https://img.shields.io/badge/chilicorn-sponsored-brightgreen.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAA4AAAAPCAMAAADjyg5GAAABqlBMVEUAAAAzmTM3pEn%2FSTGhVSY4ZD43STdOXk5lSGAyhz41iz8xkz2HUCWFFhTFFRUzZDvbIB00Zzoyfj9zlHY0ZzmMfY0ydT0zjj92l3qjeR3dNSkoZp4ykEAzjT8ylUBlgj0yiT0ymECkwKjWqAyjuqcghpUykD%2BUQCKoQyAHb%2BgylkAyl0EynkEzmkA0mUA3mj86oUg7oUo8n0k%2FS%2Bw%2Fo0xBnE5BpU9Br0ZKo1ZLmFZOjEhesGljuzllqW50tH14aS14qm17mX9%2Bx4GAgUCEx02JySqOvpSXvI%2BYvp2orqmpzeGrQh%2Bsr6yssa2ttK6v0bKxMBy01bm4zLu5yry7yb29x77BzMPCxsLEzMXFxsXGx8fI3PLJ08vKysrKy8rL2s3MzczOH8LR0dHW19bX19fZ2dna2trc3Nzd3d3d3t3f39%2FgtZTg4ODi4uLj4%2BPlGxLl5eXm5ubnRzPn5%2Bfo6Ojp6enqfmzq6urr6%2Bvt7e3t7u3uDwvugwbu7u7v6Obv8fDz8%2FP09PT2igP29vb4%2BPj6y376%2Bu%2F7%2Bfv9%2Ff39%2Fv3%2BkAH%2FAwf%2FtwD%2F9wCyh1KfAAAAKXRSTlMABQ4VGykqLjVCTVNgdXuHj5Kaq62vt77ExNPX2%2Bju8vX6%2Bvr7%2FP7%2B%2FiiUMfUAAADTSURBVAjXBcFRTsIwHAfgX%2FtvOyjdYDUsRkFjTIwkPvjiOTyX9%2FAIJt7BF570BopEdHOOstHS%2BX0s439RGwnfuB5gSFOZAgDqjQOBivtGkCc7j%2B2e8XNzefWSu%2BsZUD1QfoTq0y6mZsUSvIkRoGYnHu6Yc63pDCjiSNE2kYLdCUAWVmK4zsxzO%2BQQFxNs5b479NHXopkbWX9U3PAwWAVSY%2FpZf1udQ7rfUpQ1CzurDPpwo16Ff2cMWjuFHX9qCV0Y0Ok4Jvh63IABUNnktl%2B6sgP%2BARIxSrT%2FMhLlAAAAAElFTkSuQmCC)](http://spiceprogram.org/oss-sponsorship)

Typescript AWS Lambda to detect faces using [AWS Rekognition](https://docs.aws.amazon.com/rekognition/)

  * Typescript
  * Unit and e2e tests
  * Configuration
  * Caches Rekognition responses in S3 along with the object
  * Deployment using [Serverless framework](https://serverless.com)
  * Connected to API Gateway
  * Can be run locally (`serverless invoke`) or remotely (`curl`)
  * Payload testing using [io-ts](https://github.com/gcanti/io-ts)

## Settings and private keys management

This project uses chamber CLI tool to manage project settings and private values. 
Uses AWS Parameter Store to read and populate environment with expected variables.
To read more about chamber, take a look at my article [Using AWS and segment.io/chamber CLI for managing secrets for your projects](https://medium.com/@ruslanfg/using-segment-io-chamber-for-managing-secrets-for-your-hobby-projects-2e08faaee5e2)

## Installing && running

  * Create bucket
  * `> yarn`
  * `> yarn lint && yarn format && yarn test && yarn build`
  * IMAGE_BUCKET=my-image-bucket yarn deploy
  * Invoke Lambda via url (provide payload for example `{ "s3Url": "s3://my-image-bucket/image.jpg" }`)
  * Invoke Lambda by saving .jpg file to S3 bucket
  * Check CloudWatch logs for processing journal
  * Check S3 bucket for .face.json cached rekognition results
  * To run e2e test try `TEST_RUN_E2E=1 E2E_IMAGE_URL=s3://my-image-bucket/image.jpg yarn test`
  * To invoke function try `yarn serverless invoke -f handlePost -d '{ "s3Url": "s3://rmy-image-bucket/image.jpg" }'`

## Links

  * https://docs.aws.amazon.com/rekognition/
