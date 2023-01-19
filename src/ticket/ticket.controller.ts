import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { GetUser } from 'src/common/decorator';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @GetUser('id') userid: string) {
    return this.ticketService.create(dto, userid);
  }

  @Get()
  findAll(@Body() dto: { projectId: string }) {
    return this.ticketService.findAll(dto.projectId);
  }

  // view roles as  well
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @GetUser('id') userid: string,
  ) {
    return this.ticketService.update(id, dto, userid);
  }

  // @Patch(':id/roles')
  // updateRoles(@Param('id') id: string, @Body() dto: TicketRoles) {
  //   return this.ticketService.updateRoles(id, dto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userid: string) {
    return this.ticketService.remove(id, userid);
  }
}

// assigned to me
// by me (author)
// ticket roles // update roles

// pending verification (later) - by project
// no varified by
