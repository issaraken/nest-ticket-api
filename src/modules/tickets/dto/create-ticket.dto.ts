import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator'
import { TicketPriority, TicketStatus } from '../ticket.enums'

export class CreateTicketDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title: string

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string

  @IsEnum(TicketStatus, {
    message: 'Status must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED',
  })
  status: TicketStatus = TicketStatus.OPEN

  @IsEnum(TicketPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  })
  priority: TicketPriority = TicketPriority.MEDIUM
}
