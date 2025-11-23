import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureDto, UpdateFeatureDto } from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FEATURE_CREATION_EVENT,
  FEATURE_DELETION_EVENT,
  FEATURE_UPDATE_EVENT,
} from '@/websocket/events.constant';

@Injectable()
export class FeatureService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(projectId: string, dto: CreateFeatureDto, userId: string) {
    const feature = await this.prisma.features.create({
      data: {
        ...dto,
        projectId: projectId,
        ownerId: userId,
      },
    });

    this.eventEmitter.emit(FEATURE_CREATION_EVENT, {
      projectId,
      createdBy: userId,
      feature,
    });

    return feature;
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
    const updatedFeature = await this.prisma.features.update({
      where: {
        id,
        ownerId: userId,
      },
      data: {
        ...dto,
      },
    });

    this.eventEmitter.emit(FEATURE_UPDATE_EVENT, {
      projectId: updatedFeature.projectId,
      updatedBy: userId,
      feature: updatedFeature,
    });

    return updatedFeature;
  }

  async remove(id: string, projectId: string, userId: string) {
    await this.prisma.features.delete({
      where: {
        id,
        ownerId: userId,
      },
    });

    this.eventEmitter.emit(FEATURE_DELETION_EVENT, {
      projectId,
      deletedBy: userId,
      featureId: id,
    });

    return {
      message: 'delete successful',
    };
  }
}
