import { parseWithZod } from '@conform-to/zod/v4'
import { data, redirect } from 'react-router'

import { prisma } from '#app/services/db.server'
import {
  deleteImage,
  uploadImage,
  validateImageFile,
} from '#app/services/upload.server'

import { INTENT } from './intent'
import { updateLostItemSchema } from './schema'

export async function action({
  params,
  request,
}: {
  params: { id: string }
  request: Request
}) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === INTENT.UPDATE) {
    const submission = parseWithZod(formData, { schema: updateLostItemSchema })
    if (submission.status !== 'success') {
      return data({ result: submission.reply() }, { status: 400 })
    }
    await prisma.lostItem.update({
      where: { id: params.id },
      data: {
        name: submission.value.name,
        description: submission.value.description || null,
      },
    })
    return data({ success: true })
  }

  if (intent === INTENT.DELETE) {
    const item = await prisma.lostItem.findUnique({
      where: { id: params.id },
      include: { images: true },
    })
    if (item) {
      await Promise.all(item.images.map((img) => deleteImage(img.key)))
    }
    await prisma.lostItem.delete({ where: { id: params.id } })
    return redirect('/')
  }

  if (intent === INTENT.UPLOAD_IMAGE) {
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return data({ error: 'ファイルを選択してください' }, { status: 400 })
    }

    const validationError = validateImageFile(file)
    if (validationError) {
      return data({ error: validationError }, { status: 400 })
    }

    const { key, url } = await uploadImage(file, params.id)
    await prisma.lostItemImage.create({
      data: { lostItemId: params.id, key, url },
    })

    return data({ success: true })
  }

  if (intent === INTENT.DELETE_IMAGE) {
    const imageId = formData.get('imageId')
    if (typeof imageId !== 'string') {
      return data({ error: '画像IDが不正です' }, { status: 400 })
    }

    const image = await prisma.lostItemImage.findUnique({
      where: { id: imageId },
    })
    if (image) {
      await deleteImage(image.key)
      await prisma.lostItemImage.delete({ where: { id: imageId } })
    }

    return data({ success: true })
  }

  return data({ error: '不正なリクエストです' }, { status: 400 })
}
