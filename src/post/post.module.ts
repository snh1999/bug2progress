import { Module } from '@nestjs/common';
import { OrganizationModule } from '@/organization/organization.module';
import { UserModule } from '@/user/user.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
  imports: [OrganizationModule, UserModule],
})
export class PostModule {}
