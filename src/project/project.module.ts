import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { OrganizationModule } from 'src/organization/organization.module';
import { PostModule } from 'src/post/post.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { UserModule } from 'src/user/user.module';
import { ProjectFeatureService } from './projectxfeature.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ProjectFeatureService],
  exports: [ProjectService],
  imports: [OrganizationModule, PostModule, TicketModule, UserModule],
})
export class ProjectModule {}
