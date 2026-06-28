import { z } from 'zod'

export const updateLostItemSchema = z.object({
  name: z
    .string({ error: '名前を入力してください' })
    .min(1, '名前を入力してください'),
  description: z.string().optional(),
})
