import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './ticket-create.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsString()
  verifierId?: string;
}
