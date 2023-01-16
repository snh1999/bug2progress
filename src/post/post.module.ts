import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
  imports: [OrganizationModule],
})
export class PostModule {}
