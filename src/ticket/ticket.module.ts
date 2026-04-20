import { Module } from '@nestjs/common';
import { FeatureModule } from '@/feature/feature.module';
import { ProjectModule } from '@/project/project.module';
import { UserModule } from '@/user/user.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
  imports: [UserModule, ProjectModule, FeatureModule],
})
export class TicketModule {}
