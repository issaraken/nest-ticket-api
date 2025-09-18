import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { QUEUE_NAMES, JOB_NAMES } from './queue.constants'
import { TicketNotifyJobData } from './queue.interfaces'

@Processor(QUEUE_NAMES.TICKET_NOTIFY)
export class TicketNotifyProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketNotifyProcessor.name)

  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job<TicketNotifyJobData>): Promise<void> {
    const { ticketId, currentStatus, previousStatus } = job.data

    this.logger.log(`Processing ${job.name} for ticket ${ticketId}`)

    try {
      switch (job.name) {
        case JOB_NAMES.NOTIFY_TICKET_CREATED:
          this.handleTicketCreated(ticketId, currentStatus)
          break

        case JOB_NAMES.NOTIFY_TICKET_UPDATED:
          this.handleTicketUpdated(ticketId, currentStatus, previousStatus)
          break

        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }

      this.logger.log(
        `Successfully processed ${job.name} for ticket ${ticketId}`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to process ${job.name} for ticket ${ticketId}:`,
        error,
      )
      throw error
    }
  }

  private handleTicketCreated(ticketId: string, status: string): void {
    this.logger.log(`📧 Notification: Ticket ${ticketId} was created`)
    this.logger.log(`   Status: ${status}`)
  }

  private handleTicketUpdated(
    ticketId: string,
    currentStatus: string,
    previousStatus?: string,
  ): void {
    this.logger.log(`📧 Notification: Ticket ${ticketId} was updated`)
    this.logger.log(`   Status changed: ${previousStatus} → ${currentStatus}`)
  }
}
