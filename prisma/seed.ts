import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create some test links first
  const link1 = await prisma.link.create({
    data: {
      shortCode: 'test123',
      originalUrl: 'https://example.com',
    },
  })

  const link2 = await prisma.link.create({
    data: {
      shortCode: 'demo456',
      originalUrl: 'https://google.com',
    },
  })

  console.log('✅ Created test links')

  // Create 50 email signups with different patterns
  const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']
  const firstNames = ['john', 'jane', 'bob', 'alice', 'charlie', 'diana', 'evan', 'fiona', 'george', 'hannah']
  const lastNames = ['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez']

  const signups = []
  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
    const email = `${firstName}.${lastName}${i}@${domain}`

    // Randomly assign some to link1, some to link2, some to neither
    const rand = Math.random()
    let linkId = null
    if (rand < 0.4) {
      linkId = link1.id
    } else if (rand < 0.7) {
      linkId = link2.id
    }

    signups.push({
      email,
      linkId,
      userId: null, // All anonymous for now
    })
  }

  // Bulk create signups
  await prisma.emailSignup.createMany({
    data: signups,
  })

  console.log('✅ Created 50 email signups')
  console.log(`   - ${signups.filter(s => s.linkId === link1.id).length} signups from link: ${link1.shortCode}`)
  console.log(`   - ${signups.filter(s => s.linkId === link2.id).length} signups from link: ${link2.shortCode}`)
  console.log(`   - ${signups.filter(s => !s.linkId).length} signups without link`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
