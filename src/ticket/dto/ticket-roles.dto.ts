import {
  TicketType,
  TicketSeverity,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TicketEnumDto {
  @IsEnum(TicketType)
  @IsOptional()
  ticketType: TicketType;

  @IsEnum(TicketSeverity)
  @IsNotEmpty()
  ticketSeverity: TicketSeverity;

  @IsEnum(TicketPriority)
  @IsNotEmpty()
  ticketPriority: TicketPriority;
}

export class TicketAssignDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UpdateStatusDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  ticketStatus: TicketStatus;
}
