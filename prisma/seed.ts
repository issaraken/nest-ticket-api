import { PrismaClient, TicketStatus, TicketPriority } from '@prisma/client'

const mockTickets = [
  {
    title: 'Bug: Login form validation not working',
    description:
      'Users are able to submit empty login forms without proper validation. This needs to be fixed urgently.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Feature Request: Add dark mode',
    description:
      'Many users have requested a dark mode option for better user experience during night time usage.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.MEDIUM,
  },
  {
    title: 'Performance: Dashboard loading slowly',
    description:
      'The main dashboard is taking too long to load. Need to optimize database queries and add caching.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.URGENT,
  },
]

const prisma = new PrismaClient()

async function main() {
  await prisma.ticket.createMany({
    data: mockTickets,
    skipDuplicates: true,
  })

  console.info('✅ Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
