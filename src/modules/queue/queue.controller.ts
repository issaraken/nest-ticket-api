import { Controller, Get, Param, BadRequestException } from '@nestjs/common'
import { QueueMetricsService } from './services/queue-metrics.service'
import { QUEUE_NAMES } from './queue.constants'

@Controller('admin/queues')
export class QueueController {
  constructor(private readonly queueMetrics: QueueMetricsService) {}

  @Get(':name/stats')
  async getQueueStats(@Param('name') name: string) {
    this.validateQueueName(name)
    return await this.queueMetrics.getQueueStats(name)
  }
  private validateQueueName(name: string): void {
    const validNames = Object.values(QUEUE_NAMES)
    if (!validNames.includes(name)) {
      throw new BadRequestException(
        `Invalid queue name. Valid names: ${validNames.join(', ')}`,
      )
    }
  }
}
