import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { SortOrder } from '@common/enums/common.enums'
import { TicketPriority, TicketStatus } from '../ticket.enums'

export class FilterTicketsDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @IsOptional()
  @IsEnum(SortOrder)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : 'desc',
  )
  sortOrder?: SortOrder = SortOrder.DESC
}
