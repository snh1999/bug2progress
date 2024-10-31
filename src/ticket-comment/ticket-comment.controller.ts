import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TicketCommentService } from './ticket-comment.service';
import { CreateTicketCommentDto, UpdateTicketCommentDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorator';

@ApiTags('Ticket-comment')
@Controller('ticket/comment/:ticketid')
export class TicketCommentController {
  constructor(private readonly ticketCommentService: TicketCommentService) {}

  @Post()
  create(
    @Param('ticketid') ticketid: string,
    @Body() dto: CreateTicketCommentDto,
    @GetUser('id') userid: string,
  ) {
    return this.ticketCommentService.create(ticketid, dto, userid);
  }

  @Get()
  findAll(@Param('ticketid') ticketid: string) {
    return this.ticketCommentService.findAll(ticketid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketCommentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketCommentDto,
    @GetUser('id') userid: string,
  ) {
    return this.ticketCommentService.update(id, dto, userid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userid: string) {
    return this.ticketCommentService.remove(id, userid);
  }
}
