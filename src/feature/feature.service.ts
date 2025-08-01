import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureDto, UpdateFeatureDto } from './dto';

@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateFeatureDto, userId: string) {
    return this.prisma.features.create({
      data: {
        ...dto,
        projectId: projectId,
        ownerId: userId,
      },
    });
  }

  async findAll(projectId: string) {
    return await this.prisma.features.findMany({
      where: {
        projectId,
      },
    });
  }

  async findOne(id: string, projectId?: string) {
    return this.prisma.features.findUniqueOrThrow({
      where: {
        id,
        projectId,
      },
    });
  }

  async update(id: string, dto: UpdateFeatureDto, userId: string) {
    return this.prisma.features.update({
      where: {
        id,
        ownerId: userId,
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.prisma.features.delete({
      where: {
        id,
        ownerId: userId,
      },
    });
    return {
      message: 'delete successful',
    };
  }
}
