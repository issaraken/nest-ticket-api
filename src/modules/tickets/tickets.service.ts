import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { FilterTicketsDto } from './dto/filter-ticket.dto'
import { Prisma, Ticket } from '@prisma/client'
import { DefaultPerPageResponseModel } from 'src/common/models/response.model'
import { TicketQueueService } from '../queue/services/ticket-queue.service'
import { TicketStatus, TicketPriority } from './ticket.enums'

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: TicketQueueService,
  ) {}

  async create(dto: CreateTicketDto) {
    try {
      const ticket = await this.prisma.ticket.create({
        data: dto,
      })

      await this.queueService.addTicketCreatedNotification(
        ticket.id.toString(),
        ticket.status,
      )

      await this.queueService.addSlaMonitoringJob(
        ticket.id.toString(),
        ticket.priority as TicketPriority,
        ticket.createdAt,
      )

      return ticket
    } catch (error) {
      console.error(error)
      throw new BadRequestException('Failed to create ticket')
    }
  }

  async findAll(
    query: FilterTicketsDto,
  ): Promise<DefaultPerPageResponseModel<Ticket[]>> {
    try {
      const {
        status,
        priority,
        search,
        page = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query

      const whereClause: Prisma.TicketWhereInput = {}

      if (status) {
        whereClause.status = status
      }

      if (priority) {
        whereClause.priority = priority
      }

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const skip = (page - 1) * pageSize
      const take = pageSize

      const orderByClause: Record<string, 'asc' | 'desc'> = {
        [sortBy]: sortOrder,
      }

      const [tickets, total] = await Promise.all([
        this.prisma.ticket.findMany({
          where: whereClause,
          skip,
          take,
          orderBy: orderByClause,
        }),
        this.prisma.ticket.count({ where: whereClause }),
      ])

      const totalPages = Math.ceil(total / pageSize)
      const hasNext = page < totalPages
      const hasPrev = page > 1

      return {
        data: tickets,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      }
    } catch (error) {
      console.error(error)
      throw new BadRequestException('Failed to fetch tickets')
    }
  }

  async findOne(id: number): Promise<Ticket> {
    try {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id },
      })

      if (!ticket) {
        throw new BadRequestException(`Ticket with ID ${id} not found`)
      }

      return ticket
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error(error)
      throw new BadRequestException('Failed to fetch ticket')
    }
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    try {
      const existingTicket = await this.prisma.ticket.findUnique({
        where: { id },
      })

      if (!existingTicket) {
        throw new BadRequestException(`Ticket with ID ${id} not found`)
      }

      const updatedTicket = await this.prisma.ticket.update({
        where: { id },
        data: updateTicketDto,
      })

      await this.queueService.addTicketUpdatedNotification(
        updatedTicket.id.toString(),
        updatedTicket.status,
        existingTicket.status,
      )

      if (
        updatedTicket.status === TicketStatus.RESOLVED &&
        existingTicket.status !== TicketStatus.RESOLVED
      ) {
        await this.queueService.removeSlaMonitoringJob(
          updatedTicket.id.toString(),
        )
      }

      return updatedTicket
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error(error)
      throw new BadRequestException('Failed to update ticket')
    }
  }

  async remove(id: number): Promise<Ticket> {
    try {
      const existingTicket = await this.prisma.ticket.findUnique({
        where: { id },
      })

      if (!existingTicket) {
        throw new BadRequestException(`Ticket with ID ${id} not found`)
      }

      const deletedTicket = await this.prisma.ticket.delete({
        where: { id },
      })

      return deletedTicket
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error(error)
      throw new BadRequestException('Failed to delete ticket')
    }
  }
}
