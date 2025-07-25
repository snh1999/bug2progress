import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorator';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';
import { JwtAuthGuard } from '@/common/guard';

@ApiTags('Ticket')
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/features/:featureId/tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(
    @Body() dto: CreateTicketDto,
    @Param('featureId') featureId: string,
    @Param('projectId') projectId: string,
    @GetUser('id') userid: string,
  ) {
    return this.ticketService.create(dto, featureId, projectId, userid);
  }

  @Get('')
  findAll(
    @Param('featureId') featureId: string,
    @GetUser('id') userId: string,
  ) {
    return this.ticketService.findAll(featureId, userId);
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
