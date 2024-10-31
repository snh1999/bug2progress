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
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorator';
import { JwtAuthGuard } from '@/common/guard';

@ApiTags('Post')
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @GetUser('id') userid: string) {
    return this.postService.create(createPostDto, userid);
  }

  @Get()
  findAll(@Body() dto: { username: string }) {
    return this.postService.findAll(dto.username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('id') userid: string,
  ) {
    return this.postService.update(id, updatePostDto, userid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userid: string) {
    return this.postService.remove(id, userid);
  }
}
