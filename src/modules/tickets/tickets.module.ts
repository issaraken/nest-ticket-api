import { Module } from '@nestjs/common'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'
import { PrismaService } from '../../common/prisma.service'
import { QueueModule } from '../queue/queue.module'

@Module({
  imports: [QueueModule],
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
  exports: [TicketsService],
})
export class TicketsModule {}
