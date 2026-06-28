import { prisma } from '#app/services/db.server'

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim() || ''

  const items = await prisma.lostItem.findMany({
    where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { images: { take: 1, orderBy: { createdAt: 'asc' } } },
  })
  return { items, q }
}
