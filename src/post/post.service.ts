import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { HandlePrismaDuplicateError } from 'src/common/interceptor/handle.prisma-error';
import { OrganizationService } from 'src/organization/organization.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private orgService: OrganizationService,
  ) {}

  async create(dto: CreatePostDto, userId: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    }
    // no summary, use first line of post
    if (!dto.summary) {
      dto.summary = dto.postContent.split('.')[0];
    }
    let post;
    try {
      post = await this.prisma.post.create({
        data: {
          ...dto,
          authorId: userId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        new HandlePrismaDuplicateError(error, 'slug');
    }

    // no slug? make it same as id
    if (!post.slug) this.update(post.id, { slug: post.id }, userId);
    return {
      message: 'created successfully',
      url: '/post/' + post.id,
      postid: post.id,
    };
  }

  // send not more than 10
  async findAll(userid?: string) {
    if (userid)
      return await this.prisma.post.findMany({
        where: {
          authorId: userid,
        },
      });
    return await this.prisma.post.findMany({});
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        OR: [
          {
            id,
          },
          {
            slug: id,
          },
        ],
      },
      include: {
        postComment: {
          take: 10,
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });
    if (!post) throw new NotFoundException('404 Not found');
    return post;
  }

  async update(id: string, dto: UpdatePostDto, userid: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    }
    const post = await this.findOne(id);

    await this.prisma.post.updateMany({
      where: {
        id: post.id,
        authorId: userid,
      },
      data: {
        ...dto,
      },
    });
    return {
      message: 'updated successfully',
      url: '/post/' + post.id,
    };
  }

  async remove(id: string, userid: string) {
    const post = await this.findOne(id);

    await this.prisma.post.deleteMany({
      where: {
        id: post.id,
        authorId: userid,
      },
    });
    return {
      message: 'removed successfully',
    };
  }

  // ########################### helper function #################

  async createBasePost(userId: string, title: string, summary: string) {
    return await this.prisma.post.create({
      data: {
        title,
        postContent: 'This post is automatically genereted.' + summary,
        authorId: userId,
      },
    });
  }
}
