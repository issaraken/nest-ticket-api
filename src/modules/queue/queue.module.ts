import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'

// Controllers
import { QueueController } from './queue.controller'

// Services
import { TicketQueueService } from './services/ticket-queue.service'
import { QueueMetricsService } from './services/queue-metrics.service'

// Processors
import { TicketNotifyProcessor } from './processors/ticket-notify.processor'
import { TicketSlaProcessor } from './processors/ticket-sla.processor'

// Constants
import { QUEUE_NAMES } from './queue.constants'

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
  controllers: [QueueController],
  providers: [
    TicketQueueService,
    QueueMetricsService,
    TicketNotifyProcessor,
    TicketSlaProcessor,
  ],
  exports: [TicketQueueService, QueueMetricsService],
})
export class QueueModule {}
