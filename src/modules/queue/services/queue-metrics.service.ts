import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { QUEUE_NAMES } from '../queue.constants'

export interface QueueStats {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  total: number
}

@Injectable()
export class QueueMetricsService {
  constructor(
    @InjectQueue(QUEUE_NAMES.TICKET_NOTIFY)
    private readonly notifyQueue: Queue,
    @InjectQueue(QUEUE_NAMES.TICKET_SLA)
    private readonly slaQueue: Queue,
  ) {}

  async getQueueStats(queueName: string): Promise<QueueStats> {
    const queue = this.getQueueByName(queueName)
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ])

    const stats: QueueStats = {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total:
        waiting.length +
        active.length +
        completed.length +
        failed.length +
        delayed.length,
    }
    return stats
  }

  async getAllQueueStats(): Promise<Record<string, QueueStats>> {
    const [notifyStats, slaStats] = await Promise.all([
      this.getQueueStats(QUEUE_NAMES.TICKET_NOTIFY),
      this.getQueueStats(QUEUE_NAMES.TICKET_SLA),
    ])

    return {
      [QUEUE_NAMES.TICKET_NOTIFY]: notifyStats,
      [QUEUE_NAMES.TICKET_SLA]: slaStats,
    }
  }

  private getQueueByName(queueName: string): Queue {
    switch (queueName) {
      case QUEUE_NAMES.TICKET_NOTIFY:
        return this.notifyQueue
      case QUEUE_NAMES.TICKET_SLA:
        return this.slaQueue
      default:
        throw new Error(`Queue not found: ${queueName}`)
    }
  }
}
