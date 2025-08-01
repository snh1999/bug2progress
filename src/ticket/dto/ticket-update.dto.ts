import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './ticket-create.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsString()
  verifierId?: string;
}

class UpdateTicketPosition {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsNumber()
  @IsNotEmpty()
  position!: number;

  @IsEnum(TicketStatus)
  @IsNotEmpty()
  ticketStatus!: TicketStatus;
}

export class UpdateTicketPositionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketPosition)
  data!: UpdateTicketPosition[];
}
