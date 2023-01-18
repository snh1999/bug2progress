import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCommentDto } from './post-comment-create.dto';

export class UpdatePostCommentDto extends PartialType(CreatePostCommentDto) {}
