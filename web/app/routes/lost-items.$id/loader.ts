import { data } from 'react-router'

import { prisma } from '#app/services/db.server'

export async function loader({ params }: { params: { id: string } }) {
  const item = await prisma.lostItem.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { createdAt: 'asc' } } },
  })

  if (!item) {
    throw data('Not Found', { status: 404 })
  }

  return { item }
}
