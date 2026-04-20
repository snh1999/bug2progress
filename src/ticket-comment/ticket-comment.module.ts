import { Module } from '@nestjs/common';
import { TicketCommentController } from './ticket-comment.controller';
import { TicketCommentService } from './ticket-comment.service';

@Module({
  controllers: [TicketCommentController],
  providers: [TicketCommentService],
})
export class TicketCommentModule {}
