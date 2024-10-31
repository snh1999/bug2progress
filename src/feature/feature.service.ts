import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureDto, UpdateFeatureDto } from './dto';

@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFeatureDto, userId: string) {
    return this.prisma.features.create({
      data: {
        ...dto,
        basePost: {
          create: {
            title: dto.title,
            postContent: `This post is automatically genereted for feature ${dto.title}.`,
            authorId: userId,
          },
        },
      },
    });
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
