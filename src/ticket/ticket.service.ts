import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { FeatureService } from '@/feature/feature.service';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
    private featureService: FeatureService,
  ) {}
  async create(
    dto: CreateTicketDto,
    featureId: string,
    projectId: string,
    userId: string,
  ) {
    await this.featureService.findOne(featureId, projectId);
    await this.checkPermission(projectId, userId);

    const ticket = await this.prisma.ticket.create({
      data: {
        ...dto,
        featureId,
        projectId,
        creatorId: userId,
      },
    });

    return ticket;
  }

  async findAll(featureId: string, userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        featureId,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.ticket.findUniqueOrThrow({
      where: {
        id,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
        },
      },
    });
  }

  async update(
    id: string,
    projectId: string,
    dto: UpdateTicketDto,
    userid: string,
  ) {
    await this.checkPermission(projectId, userid);
    return this.prisma.ticket.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, projectId: string, userid: string) {
    await this.checkPermission(projectId, userid);
    await this.prisma.ticket.delete({
      where: {
        id,
        creatorId: userid,
      },
    });
    return {
      message: 'delete successful',
    };
  }

  async checkPermission(projectId: string, userId: string) {
    await this.projectService.findOne(projectId, userId);
  }
}
