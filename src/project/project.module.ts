import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { OrganizationModule } from 'src/organization/organization.module';
import { PostModule } from 'src/post/post.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
  imports: [OrganizationModule, PostModule],
})
export class ProjectModule {}
