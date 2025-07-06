import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePostDto, userId: string) {
    // if (dto.organizationId) {
    //   dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    // }

    if (!dto.summary) {
      dto.summary = dto.postContent.substring(0, 100) + '...';
    }

    const post = await this.prisma.post.create({
      data: {
        ...dto,
        authorId: userId,
      },
    });

    if (!post.slug) await this.update(post.id, { slug: post.id }, userId);
    return post;
  }

  async findAll(user?: string) {
    if (user)
      return this.prisma.post.findMany({
        where: {
          author: {
            OR: [{ id: user }, { profile: { username: user } }],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              joinedAt: true,
              profile: {
                select: {
                  username: true,
                  name: true,
                  photo: true,
                },
              },
            },
          },
        },
      });
    return this.prisma.post.findMany({});
  }

  async findOne(id: string) {
    return this.prisma.post.findFirstOrThrow({
      where: {
        OR: [{ id }, { slug: id }],
        project: null,
        features: null,
      },
      include: {
        author: {
          select: {
            joinedAt: true,
            profile: {
              select: {
                username: true,
                name: true,
                photo: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdatePostDto, userid: string) {
    const post = await this.findOne(id);

    return this.prisma.post.update({
      where: {
        id: post.id,
        authorId: userid,
      },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const post = await this.findOne(id);

    if (!post) {
      throw new BadRequestException(
        'Post not found or it is associated with a project or feature',
      );
    }
    await this.prisma.post.delete({
      where: {
        id: post.id,
        authorId: userId,
        project: null,
        features: null,
      },
    });

    return {
      message: 'Successfully Deleted',
    };
  }

  // ########################### helper function #################

  async createBasePost(userId: string, title: string, options?: UpdatePostDto) {
    return this.prisma.post.create({
      data: {
        title,
        ...options,
        postContent: options?.postContent ?? 'Automatically filled content.',
        authorId: userId,
      },
    });
  }
}
