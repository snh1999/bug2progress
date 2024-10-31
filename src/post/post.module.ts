import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { OrganizationModule } from '@/organization/organization.module';
import { UserModule } from '@/user/user.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
  imports: [OrganizationModule, UserModule],
})
export class PostModule {}
