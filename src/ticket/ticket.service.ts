import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  UpdateTicketPositionDto,
} from './dto';
import { FeatureService } from '@/feature/feature.service';
import { FindAllTicketsQuery } from './dto/find-ticket.query';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TICKET_REARRANGEMENT_EVENT,
  TICKET_CREATION_EVENT,
  TICKET_UPDATE_EVENT,
  TICKET_DELETION_EVENT,
} from '@/websocket/events.constant';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
    private featureService: FeatureService,
    private eventEmitter: EventEmitter2,
  ) {}
  async create(dto: CreateTicketDto, projectId: string, userId: string) {
    if (dto.featureId)
      await this.featureService.findOne(dto.featureId, projectId);
    await this.checkPermission(projectId, userId);

    const ticket = await this.prisma.ticket.create({
      data: {
        ...dto,
        projectId,
        creatorId: userId,
      },
    });

    this.eventEmitter.emit(TICKET_CREATION_EVENT, {
      projectId,
      creatorId: userId,
      ticket: ticket,
    });

    return ticket;
  }

  async findAll(projectId: string, query: FindAllTicketsQuery, userId: string) {
    const {
      title,
      description,
      dueAt,
      creatorId,
      position,
      ticketType,
      ticketPriority,
      ticketStatus,
      featureId,
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
      ...(featureId && { featureId }),
      ...(verifierId && { verifierId }),
      ...(assignedContributorId && { assignedContributorId }),
    };

    await this.checkPermission(projectId, userId);

    return this.prisma.ticket.findMany({
      where: {
        projectId,
        ...conditions,
      },
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
      include: {
        feature: true,
        creator: { include: { profile: true } },
        assignedContributor: { include: { profile: true } },
        verifiedBy: { include: { profile: true } },
      },
    });
  }

  async updateArrangement(
    projectId: string,
    dto: UpdateTicketPositionDto,
    userId: string,
  ) {
    await this.checkPermission(projectId, userId);

    const { data } = dto;

    const updatedTickets = await this.prisma.$transaction(async (prisma) => {
      const updates = data.map(({ id, ...rest }) =>
        prisma.ticket.update({
          where: { id },
          data: rest,
        }),
      );

      return Promise.all(updates);
    });

    this.eventEmitter.emit(TICKET_REARRANGEMENT_EVENT, {
      projectId,
      tickets: updatedTickets,
      movedBy: userId,
    });

    return updatedTickets;
  }

  async update(
    id: string,
    projectId: string,
    dto: UpdateTicketDto,
    userId: string,
  ) {
    await this.checkPermission(projectId, userId);
    const updatedTicket = this.prisma.ticket.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });

    this.eventEmitter.emit(TICKET_UPDATE_EVENT, {
      projectId,
      updatedBy: userId,
      ticket: updatedTicket,
    });

    return updatedTicket;
  }

  async remove(id: string, projectId: string, userId: string) {
    await this.checkPermission(projectId, userId);
    await this.prisma.ticket.delete({
      where: {
        id,
        creatorId: userId,
      },
    });

    this.eventEmitter.emit(TICKET_DELETION_EVENT, {
      projectId,
      deletedBy: userId,
      ticketId: id,
    });

    return {
      message: 'delete successful',
    };
  }

  async checkPermission(projectId: string, userId: string) {
    try {
      await this.projectService.findOne(projectId, userId);
    } catch {
      throw new ForbiddenException('Invalid project or contributor');
    }
  }
}
