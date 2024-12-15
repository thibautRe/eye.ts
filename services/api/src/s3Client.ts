import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
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

const endpointUrl = new URL(Bun.env.S3_ENDPOINT)
endpointUrl.hostname = `${Bun.env.S3_BUCKET}.${endpointUrl.hostname}`
const PUBLIC_S3_ENDPOINT = endpointUrl.toString()
export const getPublicEndpoint = (Key: string) => `${PUBLIC_S3_ENDPOINT}${Key}`

type PutS3Input = Omit<PutObjectCommandInput, "Bucket">
export const putS3 = async (input: PutS3Input) =>
  client.send(new PutObjectCommand({ Bucket: Bun.env.S3_BUCKET, ...input }))

type S3PictureMetadata =
  | { pictureType: "ORIGINAL" }
  | { pictureType: "RESIZED"; width: string }
type PutS3PictureInput = Omit<
  PutS3Input,
  "ACL" | "ContentType" | "Metadata"
> & {
  Metadata: S3PictureMetadata
}
export const putS3Picture = async (input: PutS3PictureInput) =>
  putS3({ ACL: "public-read", ContentType: "image/jpeg", ...input })
