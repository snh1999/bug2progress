import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorator';
import { JwtAuthGuard } from '@/common/guard';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';
import {
  CreateTicketDto,
  UpdateTicketDto,
  UpdateTicketPositionDto,
} from './dto';
import { FindAllTicketsQuery } from './dto/find-ticket.query';
import { TicketService } from './ticket.service';

@ApiTags('Ticket')
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(
    @Body() dto: CreateTicketDto,
    @Param('projectId') projectId: string,
    @GetUser('id') userid: string,
  ) {
    return this.ticketService.create(dto, projectId, userid);
  }

  @Get('')
  findAll(
    @Param('projectId') projectId: string,
    @Query() query: FindAllTicketsQuery,
    @GetUser('id') userId: string,
  ) {
    return this.ticketService.findAll(projectId, query, userId);
  }

  @Patch('')
  updateArrangement(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateTicketPositionDto,
    @GetUser('id') userid: string,
  ) {
    return this.ticketService.updateArrangement(projectId, dto, userid);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.ticketService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateTicketDto,
    @GetUser('id') userid: string,
  ) {
    return this.ticketService.update(id, projectId, dto, userid);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @GetUser('id') userid: string,
  ) {
    return this.ticketService.remove(id, projectId, userid);
  }
}
