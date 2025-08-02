import {
  IsDateString,
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
  @IsOptional()
  ticketType?: TicketType;

  @IsEnum(TicketPriority)
  @IsOptional()
  ticketPriority!: TicketPriority;

  @IsEnum(TicketStatus)
  @IsNotEmpty()
  ticketStatus!: TicketStatus;

  @IsInt()
  @IsNotEmpty()
  position!: number;

  @IsString()
  @IsOptional()
  assignedContributorId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsString()
  @IsOptional()
  featureId?: string;
}
