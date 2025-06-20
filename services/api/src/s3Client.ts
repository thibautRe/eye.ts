import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type GetObjectCommandInput,
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
export const getPublicEndpoint = (Key: string) =>
  `${PUBLIC_S3_ENDPOINT}${encodeURIComponent(Key)}`

type PutS3Input = Omit<PutObjectCommandInput, "Bucket">
export const putS3 = async (input: PutS3Input) =>
  client.send(new PutObjectCommand({ Bucket: Bun.env.S3_BUCKET, ...input }))

type GetS3Input = Omit<GetObjectCommandInput, "Bucket">
export const getS3 = async (get: GetS3Input) =>
  client.send(new GetObjectCommand({ Bucket: Bun.env.S3_BUCKET, ...get }))

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
