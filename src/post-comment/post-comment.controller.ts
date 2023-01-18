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
import { GetUser } from 'src/common/decorator';
import { JwtAuthGuard } from 'src/common/guard';

@UseGuards(JwtAuthGuard)
@Controller('post/comment/:postid')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @Post()
  create(
    @Param('postid') postid: string,
    @Body() dto: CreatePostCommentDto,
    @GetUser('id') userid: string,
  ) {
    return this.postCommentService.create(postid, dto, userid);
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
    @GetUser('id') userid: string,
  ) {
    return this.postCommentService.update(id, dto, userid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userid: string) {
    return this.postCommentService.remove(id, userid);
  }
}
