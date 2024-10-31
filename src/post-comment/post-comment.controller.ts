import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostCommentService } from './post-comment.service';
import { CreatePostCommentDto, UpdatePostCommentDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guard';
import { GetUser } from '@/common/decorator';

@ApiTags('Post-Comment')
@UseGuards(JwtAuthGuard)
@Controller('post/comment/:postId')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @Post()
  create(
    @Param('postId') postId: string,
    @Body() dto: CreatePostCommentDto,
    @GetUser('id') userId: string,
  ) {
    return this.postCommentService.create(postId, dto, userId);
  }

  @Get()
  findAll(@Param('postid') postid: string) {
    return this.postCommentService.findAll(postid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postCommentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostCommentDto,
    @GetUser('id') userId: string,
  ) {
    return this.postCommentService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.postCommentService.remove(id, userId);
  }
}
