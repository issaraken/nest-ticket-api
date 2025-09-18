import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { QUEUE_NAMES, JOB_NAMES, JOB_OPTIONS } from './queue.constants'
import { TicketNotifyJobData, TicketSlaJobData } from './queue.interfaces'
import { TicketPriority } from '../ticket.enums'

@Injectable()
export class TicketQueueService {
  private readonly logger = new Logger(TicketQueueService.name)

  constructor(
    @InjectQueue(QUEUE_NAMES.TICKET_NOTIFY)
    private readonly notifyQueue: Queue<TicketNotifyJobData>,
    @InjectQueue(QUEUE_NAMES.TICKET_SLA)
    private readonly slaQueue: Queue<TicketSlaJobData>,
  ) {}

  async addTicketCreatedNotification(
    ticketId: string,
    status: string,
  ): Promise<void> {
    const jobData: TicketNotifyJobData = {
      ticketId,
      action: 'created',
      currentStatus: status,
    }

    const jobId = `notify:${ticketId}`

    try {
      await this.notifyQueue.add(JOB_NAMES.NOTIFY_TICKET_CREATED, jobData, {
        ...JOB_OPTIONS.NOTIFY,
        jobId,
      })

      this.logger.log(`เพิ่ม notification job สำหรับ ticket ${ticketId} แล้ว`)
    } catch (error) {
      this.logger.error(
        `ไม่สามารถเพิ่ม notification job สำหรับ ticket ${ticketId}:`,
        error,
      )
      throw error
    }
  }

  async addTicketUpdatedNotification(
    ticketId: string,
    currentStatus: string,
    previousStatus?: string,
  ): Promise<void> {
    const jobData: TicketNotifyJobData = {
      ticketId,
      action: 'updated',
      currentStatus,
      previousStatus,
    }

    const jobId = `notify:${ticketId}:${Date.now()}`

    try {
      await this.notifyQueue.add(JOB_NAMES.NOTIFY_TICKET_UPDATED, jobData, {
        ...JOB_OPTIONS.NOTIFY,
        jobId,
      })

      this.logger.log(
        `เพิ่ม update notification job สำหรับ ticket ${ticketId} แล้ว`,
      )
    } catch (error) {
      this.logger.error(
        `ไม่สามารถเพิ่ม update notification job สำหรับ ticket ${ticketId}:`,
        error,
      )
      throw error
    }
  }

  async addSlaMonitoringJob(
    ticketId: string,
    priority: TicketPriority,
    createdAt: Date,
  ): Promise<void> {
    const slaMinutes = 15
    const delayMs = slaMinutes * 60 * 1000 // milliseconds

    const jobData: TicketSlaJobData = {
      ticketId,
      createdAt,
      priority,
      slaMinutes,
    }

    const jobId = `sla:${ticketId}`

    try {
      await this.slaQueue.add(JOB_NAMES.CHECK_TICKET_SLA, jobData, {
        ...JOB_OPTIONS.SLA,
        delay: delayMs,
        jobId,
      })

      this.logger.log(
        `เพิ่ม SLA monitoring job สำหรับ ticket ${ticketId} (${slaMinutes} นาที) แล้ว`,
      )
    } catch (error) {
      this.logger.error(
        `ไม่สามารถเพิ่ม SLA monitoring job สำหรับ ticket ${ticketId}:`,
        error,
      )
      throw error
    }
  }

  async removeSlaMonitoringJob(ticketId: string): Promise<void> {
    const jobId = `sla:${ticketId}`

    try {
      const job = await this.slaQueue.getJob(jobId)
      if (job) {
        await job.remove()
        this.logger.log(`ลบ SLA monitoring job สำหรับ ticket ${ticketId} แล้ว`)
      } else {
        this.logger.log(`ไม่พบ SLA job สำหรับ ticket ${ticketId}`)
      }
    } catch (error) {
      this.logger.error(
        `ไม่สามารถลบ SLA monitoring job สำหรับ ticket ${ticketId}:`,
        error,
      )
    }
  }
}
