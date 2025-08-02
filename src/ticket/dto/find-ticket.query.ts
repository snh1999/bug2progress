import { IsOptional, IsString } from 'class-validator';
import { UpdateTicketDto } from './ticket-update.dto';

export class FindAllTicketsQuery extends UpdateTicketDto {
  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}
