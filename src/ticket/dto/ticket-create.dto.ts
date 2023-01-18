import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketType, TicketSeverity, TicketPriority } from '@prisma/client';
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsOptional()
  closedAt: string;

  @IsEnum(TicketType)
  @IsNotEmpty()
  ticketType: TicketType;

  @IsEnum(TicketSeverity)
  @IsNotEmpty()
  ticketSeverity: TicketSeverity;

  @IsEnum(TicketPriority)
  @IsNotEmpty()
  ticketPriority: TicketPriority;

  @IsString()
  @IsNotEmpty()
  projectId: string; // maybe url

  @IsString()
  @IsOptional()
  projectXFeaturesFeaturesId?: string;
}
