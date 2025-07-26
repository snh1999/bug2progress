import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketPriority, TicketStatus, TicketType } from '@prisma/client';
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(TicketType)
  @IsNotEmpty()
  ticketType!: TicketType;

  @IsEnum(TicketPriority)
  @IsNotEmpty()
  ticketPriority!: TicketPriority;

  @IsEnum(TicketStatus)
  @IsNotEmpty()
  ticketStatus!: TicketStatus;

  @IsInt()
  @IsNotEmpty()
  position!: number;

  @IsString()
  @IsOptional()
  assignedbyId?: string;
}
