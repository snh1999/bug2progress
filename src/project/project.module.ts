import { Module } from '@nestjs/common';
import { OrganizationModule } from '@/organization/organization.module';
import { PostModule } from '@/post/post.module';
import { UserModule } from '@/user/user.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
  imports: [OrganizationModule, PostModule, UserModule],
})
export class ProjectModule {}
