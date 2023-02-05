import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  // TODO- check orgid at frontend?
  async create(dto: CreatePostDto, userId: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    }
    // no summary, use first line of post
    if (!dto.summary) {
      dto.summary = dto.postContent.split('.')[0];
    }
    const post = await this.prisma.post.create({
      data: {
        ...dto,
        authorId: userId,
      },
    });

    // no slug? make it same as id
    if (!post.slug) await this.update(post.id, { slug: post.id }, userId);
    return post;
  }

  // send not more than 10
  async findAll(username?: string) {
    if (username)
      return this.prisma.post.findMany({
        where: {
          author: {
            profile: {
              username: username,
            },
          },
        },
      });
    return this.prisma.post.findMany({});
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
    });
    if (!post) throw new NotFoundException('404 Not found');
    return post;
  }

  // TODO- check orgid at frontend?
  async update(id: string, dto: UpdatePostDto, userid: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    }
    const post = await this.findOne(id);

    return this.prisma.post.updateMany({
      where: {
        AND: [{ id: post.id }, { authorId: userid }],
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userid: string) {
    const post = await this.findOne(id);

    const deleted = await this.prisma.post.deleteMany({
      where: {
        AND: [
          { id: post.id },
          { authorId: userid },
          { project: null },
          { features: null },
        ],
      },
    });
    console.log(deleted);
    if (deleted.count == 1)
      return {
        message: 'removed successfully',
      };
    else throw new InternalServerErrorException('Something went wrong');
  }

  // ########################### helper function #################

  async createBasePost(userId: string, title: string) {
    return this.prisma.post.create({
      data: {
        title,
        postContent: 'This post is automatically genereted.',
        authorId: userId,
      },
    });
  }
}
