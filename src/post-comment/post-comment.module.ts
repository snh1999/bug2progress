import { Module } from '@nestjs/common';
import { PostModule } from '@/post/post.module';
import { PostCommentController } from './post-comment.controller';
import { PostCommentService } from './post-comment.service';

@Module({
  controllers: [PostCommentController],
  providers: [PostCommentService],
  imports: [PostModule],
})
export class PostCommentModule {}
