import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  UpdateTicketPositionDto,
} from './dto';
import { FeatureService } from '@/feature/feature.service';
import { FindAllTicketsQuery } from './dto/find-ticket.query';

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

  async findAll(featureId: string, query: FindAllTicketsQuery, userId: string) {
    const {
      title,
      description,
      dueAt,
      creatorId,
      position,
      ticketType,
      ticketPriority,
      ticketStatus,
      projectId,
      verifierId,
      assignedContributorId,
    } = query;

    const conditions: any = {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(description && {
        description: { contains: description, mode: 'insensitive' },
      }),
      ...(dueAt && { dueAt: new Date(dueAt) }),
      ...(creatorId && { creatorId }),
      ...(typeof position === 'number' && { position }),
      ...(ticketType && { ticketType }),
      ...(ticketPriority && { ticketPriority }),
      ...(ticketStatus && { ticketStatus }),
      ...(projectId && { projectId }),
      ...(featureId && { featureId }),
      ...(verifierId && { verifierId }),
      ...(assignedContributorId && { assignedContributorId }),
      project: {
        OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
      },
    };

    return this.prisma.ticket.findMany({
      where: conditions,
      include: {
        feature: true,
        creator: { include: { profile: true } },
        assignedContributor: { include: { profile: true } },
        verifiedBy: { include: { profile: true } },
      },
      orderBy: {
        position: 'asc',
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

  async updateArrangement(
    projectId: string,
    dto: UpdateTicketPositionDto,
    userid: string,
  ) {
    await this.checkPermission(projectId, userid);

    const { data } = dto;

    return this.prisma.$transaction(async (prisma) => {
      const updates = data.map(({ id, ...rest }) =>
        prisma.ticket.update({
          where: { id },
          data: rest,
        }),
      );

      return Promise.all(updates);
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
