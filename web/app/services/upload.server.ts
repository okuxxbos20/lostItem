import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import { s3, S3_BUCKET } from '#app/services/s3.server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'ico',
  'avif',
  'heic',
  'heif',
])

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'ファイルサイズは10MB以下にしてください'
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return `許可されていないファイル形式です（許可: ${[...ALLOWED_EXTENSIONS].join(', ')}）`
  }

  return null
}

export async function uploadImage(
  file: File,
  lostItemId: string,
): Promise<{ key: string; url: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const key = `lost-items/${lostItemId}/${crypto.randomUUID()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  )

  const endpoint = process.env.S3_ENDPOINT ?? ''
  const url = `${endpoint}/${S3_BUCKET}/${key}`

  return { key, url }
}

export async function deleteImage(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  )
}
