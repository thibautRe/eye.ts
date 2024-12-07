import {
  PutObjectCommand,
  S3Client,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3"

declare module "bun" {
  interface Env {
    S3_ENDPOINT: string
    S3_BUCKET: string
    S3_REGION: string
    S3_ACCESS_KEY: string
    S3_SECRET_KEY: string
  }
}

const client = new S3Client({
  credentials: {
    accessKeyId: Bun.env.S3_ACCESS_KEY,
    secretAccessKey: Bun.env.S3_SECRET_KEY,
  },
  endpoint: Bun.env.S3_ENDPOINT,
  region: Bun.env.S3_REGION,
})

export const storePictureS3 = async (
  key: string,
  body: PutObjectCommandInput["Body"],
) => {
  client.send(
    new PutObjectCommand({
      Bucket: Bun.env.S3_BUCKET,
      Key: key,
      Body: body,
      ACL: "public-read",
      ContentType: "image/jpeg",
    }),
  )
}
