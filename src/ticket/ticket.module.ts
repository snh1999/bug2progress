import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { UserModule } from '@/user/user.module';
import { ProjectModule } from '@/project/project.module';
import { FeatureModule } from '@/feature/feature.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
  imports: [UserModule, ProjectModule, FeatureModule],
})
export class TicketModule {}
