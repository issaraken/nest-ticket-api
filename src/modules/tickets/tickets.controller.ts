import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { FilterTicketsDto } from './dto/filter-ticket.dto'

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto)
  }

  @Get()
  findAll(@Query() query: FilterTicketsDto) {
    return this.ticketsService.findAll(query)
  }
}
