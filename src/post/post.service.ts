import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePostDto, userId: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.getOrgIdfromUrl(dto.organizationId);
      if (!dto.organizationId) {
        throw new BadRequestException('Incorrect Organization Url');
      }
    }
    const post = await this.prisma.post.create({
      data: {
        ...dto,
        authorId: userId,
      },
    });

    // no slug? make it same as id
    if (!post.slug) this.update(post.id, { slug: post.id }, userId);
    return {
      message: 'created successfully',
      url: '/post/' + post.id,
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
    return await this.prisma.post.findFirst({
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
    });
  }

  async update(id: string, dto: UpdatePostDto, userid: string) {
    const post = await this.findOne(id);
    this.checkauthorization(post, userid);

    await this.prisma.post.update({
      where: {
        id: post.id,
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
    this.checkauthorization(post, userid);
    await this.prisma.post.delete({
      where: {
        id: post.id,
      },
    });
    return {
      message: 'removed successfully',
    };
  }

  checkauthorization(post: Post, userid: string) {
    if (!post) throw new NotFoundException('404 not found');
    if (post.authorId != userid)
      throw new UnauthorizedException('You are not author of the post');
  }

  // ########################### helper function #################
  async getOrgIdfromUrl(url: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: url,
      },
      select: {
        id: true,
      },
    });
    if (org) return org.id;
  }
}
