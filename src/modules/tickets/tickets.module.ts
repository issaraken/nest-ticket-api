import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'
import { PrismaService } from '../../common/prisma.service'
import { TicketQueueService } from './queue/ticket-queue.service'
import { TicketNotifyProcessor } from './queue/ticket-notify.processor'
import { TicketSlaProcessor } from './queue/ticket-sla.processor'
import { QUEUE_NAMES } from './queue/queue.constants'

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.TICKET_NOTIFY,
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      },
      {
        name: QUEUE_NAMES.TICKET_SLA,
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      },
    ),
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    PrismaService,
    TicketQueueService,
    TicketNotifyProcessor,
    TicketSlaProcessor,
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
