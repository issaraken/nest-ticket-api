import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants'
import { TicketSlaJobData } from '../queue.models'

@Processor(QUEUE_NAMES.TICKET_SLA)
export class TicketSlaProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketSlaProcessor.name)

  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job<TicketSlaJobData>): Promise<void> {
    const { ticketId, createdAt, priority, slaMinutes } = job.data

    this.logger.log(`Processing SLA check for ticket ${ticketId}`)

    try {
      if (job.name === JOB_NAMES.CHECK_TICKET_SLA) {
        this.handleSlaCheck(ticketId, createdAt, priority, slaMinutes)
      } else {
        this.logger.warn(`Unknown SLA job name: ${job.name}`)
      }

      this.logger.log(`Successfully processed SLA check for ticket ${ticketId}`)
    } catch (error) {
      this.logger.error(
        `Failed to process SLA check for ticket ${ticketId}:`,
        error,
      )
      throw error
    }
  }

  private handleSlaCheck(
    ticketId: string,
    createdAt: Date,
    priority: string,
    slaMinutes: number,
  ): void {
    const now = new Date()
    const slaDeadline = new Date(createdAt.getTime() + slaMinutes * 60 * 1000)
    const isOverdue = now > slaDeadline
    const minutesOverdue = isOverdue
      ? Math.floor((now.getTime() - slaDeadline.getTime()) / (1000 * 60))
      : 0

    this.logger.log(`⏰ SLA Check for Ticket ${ticketId}:`)
    this.logger.log(`   Priority: ${priority}`)
    this.logger.log(`   SLA Duration: ${slaMinutes} minutes`)
    this.logger.log(`   Created: ${createdAt.toISOString()}`)
    this.logger.log(`   SLA Deadline: ${slaDeadline.toISOString()}`)
    this.logger.log(`   Current Time: ${now.toISOString()}`)

    if (isOverdue) {
      this.logger.warn(
        `🚨 SLA VIOLATION: Ticket ${ticketId} is ${minutesOverdue} minutes overdue!`,
      )
    } else {
      const remainingMinutes = Math.floor(
        (slaDeadline.getTime() - now.getTime()) / (1000 * 60),
      )
      this.logger.log(`✅ SLA OK: ${remainingMinutes} minutes remaining`)
    }
  }
}
