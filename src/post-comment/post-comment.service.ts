import { Injectable } from '@nestjs/common';
import { PostService } from 'src/post/post.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostCommentDto, UpdatePostCommentDto } from './dto';

@Injectable()
export class PostCommentService {
  constructor(
    private prisma: PrismaService,
    private postService: PostService,
  ) {}

  // check if post is public or user is author (separate function)
  // comment reply

  // TODO- check postid at frontend?
  async create(postid: string, dto: CreatePostCommentDto, userid: string) {
    // parent post = post id from param
    const post = await this.postService.findOne(postid);
    // author comes from @GetUser and text contained in dto
    return await this.prisma.postComment.create({
      data: {
        ...dto,
        parentPostId: post.id,
        authorId: userid,
      },
    });
  }

  async findAll(postid: string) {
    const post = await this.postService.findOne(postid);
    return await this.prisma.postComment.findMany({
      where: {
        parentPostId: post.id,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.postComment.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, dto: UpdatePostCommentDto, userid: string) {
    return await this.prisma.postComment.updateMany({
      where: {
        id,
        authorId: userid,
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userid: string) {
    await this.prisma.postComment.deleteMany({
      where: {
        id,
        authorId: userid,
      },
    });
    return {
      message: 'deleted successfully',
    };
  }
}
