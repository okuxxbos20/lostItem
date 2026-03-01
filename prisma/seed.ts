import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'

const prisma = new PrismaClient()

async function main() {
  await prisma.lostItem.deleteMany()

  await prisma.lostItem.createMany({
    data: [
      {
        name: '黒い財布',
        description: '2階のトイレ付近で発見。中にカードが数枚入っています。',
      },
      {
        name: '折りたたみ傘（青）',
        description: '1階ロビーの傘立てに放置されていました。',
      },
      {
        name: 'AirPods Pro',
        description: '会議室Bの机の上にありました。ケース付き。',
      },
    ],
  })

  console.log('Seed data created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
