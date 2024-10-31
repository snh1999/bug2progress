import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectFeatureService } from './projectxfeature.service';
import { OrganizationModule } from '@/organization/organization.module';
import { PostModule } from '@/post/post.module';
import { UserModule } from '@/user/user.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ProjectFeatureService],
  exports: [ProjectService],
  imports: [OrganizationModule, PostModule, UserModule],
})
export class ProjectModule {}
