import { Module } from '@nestjs/common';
import { PostCommentService } from './post-comment.service';
import { PostCommentController } from './post-comment.controller';
import { PostModule } from 'src/post/post.module';

@Module({
  controllers: [PostCommentController],
  providers: [PostCommentService],
  imports: [PostModule],
})
export class PostCommentModule {}
