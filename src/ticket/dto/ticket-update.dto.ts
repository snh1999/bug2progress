import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './ticket-create.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}

export class UpdateTicketPositionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketPosition)
  data!: UpdateTicketPosition[];
}
