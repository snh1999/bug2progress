import { Injectable, NotFoundException } from '@nestjs/common';
import { Features } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
// import { HandlePrismaDuplicateError } from 'src/common/interceptor/handle.prisma-error';
import { PostService } from '../post/post.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { CreateFeatureDto, UpdateFeatureDto } from './dto';

@Injectable()
export class FeatureService {
  constructor(
    private prisma: PrismaService,
    private postService: PostService,
    private userService: UserService,
  ) {}

  async create(dto: CreateFeatureDto, userId: string) {
    const post = await this.postService.createBasePost(userId, dto.title);
    let feature: Features;
    try {
      feature = await this.prisma.features.create({
        data: {
          ...dto,
          postId: post.id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        await this.postService.remove(post.id, userId);
      // new HandlePrismaDuplicateError(error, 'id');
    }
    return feature;
  }

  async findAll(userid?: string) {
    if (userid)
      return await this.prisma.features.findMany({
        where: {
          basePost: {
            authorId: userid,
          },
        },
      });
    return this.prisma.features.findMany({});
  }

  async findOne(id: string) {
    const feature = await this.prisma.features.findFirst({
      where: {
        id,
      },
    });
    if (!feature) throw new NotFoundException('404 Not found');
    return feature;
  }

  async update(id: string, dto: UpdateFeatureDto, userid: string) {
    return this.prisma.features.updateMany({
      where: {
        AND: [
          { id },
          {
            basePost: {
              authorId: userid,
            },
          },
        ],
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userid: string) {
    const feature = await this.findOne(id);
    await this.prisma.post.deleteMany({
      where: {
        AND: [{ id: feature.postId }, { authorId: userid }],
      },
    });
    return {
      message: 'delete successful',
    };
  }
}
