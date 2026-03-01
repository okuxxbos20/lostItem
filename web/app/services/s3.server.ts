import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.S3_REGION ?? 'ap-northeast-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // MinIOではパススタイルが必要
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET_KEY ?? '',
  },
})

export const S3_BUCKET = process.env.S3_BUCKET ?? 'lostitem'
