import { parseWithZod } from '@conform-to/zod/v4'
import { data } from 'react-router'

import { prisma } from '#app/services/db.server'

import { createLostItemSchema } from './schema'

export async function action({ request }: { request: Request }) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: createLostItemSchema })

  if (submission.status !== 'success') {
    return data({ result: submission.reply() }, { status: 400 })
  }

  await prisma.lostItem.create({
    data: {
      name: submission.value.name,
      description: submission.value.description || null,
    },
  })

  return data({ success: true })
}
