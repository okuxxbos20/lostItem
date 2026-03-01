import { afterEach } from 'vitest'

import { PrismaClient } from '../generated/prisma/client.js'

const prisma = new PrismaClient()

afterEach(async () => {
  await prisma.lostItem.deleteMany()
})
