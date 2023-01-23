import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
  imports: [UserModule, ProjectModule],
})
export class TicketModule {}
