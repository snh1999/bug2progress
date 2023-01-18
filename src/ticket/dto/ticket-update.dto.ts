import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './ticket-create.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
