import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketCommentDto, UpdateTicketCommentDto } from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  COMMENT_CREATION_EVENT,
  COMMENT_UPDATE_EVENT,
  COMMENT_DELETION_EVENT,
} from '@/websocket/events.constant';

@Injectable()
export class TicketCommentService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  private async getProjectId(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      select: { projectId: true },
    });
    await this.prisma.projectContributor.findFirstOrThrow({
      where: {
        projectId: ticket.projectId,
        userId,
      },
    });

    return ticket.projectId;
  }

  async create(ticketid: string, dto: CreateTicketCommentDto, userId: string) {
    const projectId = await this.getProjectId(ticketid, userId);

    const comment = await this.prisma.ticketComment.create({
      data: {
        text: dto.text,
        parentTicketId: ticketid,
        authorId: userId,
      },
    });

    if (projectId) {
      this.eventEmitter.emit(COMMENT_CREATION_EVENT, {
        projectId,
        createdBy: userId,
        comment,
        ticketId: ticketid,
      });
    }

    return comment;
  }

  findAll(ticketid: string) {
    return this.prisma.ticketComment.findMany({
      where: {
        parentTicketId: ticketid,
      },
      include: {
        author: { include: { profile: true } },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.ticketComment.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, dto: UpdateTicketCommentDto, userId: string) {
    const existingComment = await this.prisma.ticketComment.findUniqueOrThrow({
      where: { id },
      select: { parentTicketId: true },
    });

    const projectId = await this.getProjectId(
      existingComment.parentTicketId,
      userId,
    );

    const comment = await this.prisma.ticketComment.update({
      where: {
        id,
        authorId: userId,
      },
      data: {
        ...dto,
      },
    });

    if (projectId) {
      this.eventEmitter.emit(COMMENT_UPDATE_EVENT, {
        projectId,
        updatedBy: userId,
        comment,
        ticketId: existingComment.parentTicketId,
      });
    }

    return comment;
  }

  async remove(id: string, userId: string) {
    const existingComment = await this.prisma.ticketComment.findUnique({
      where: { id },
      select: { parentTicketId: true },
    });

    await this.prisma.ticketComment.deleteMany({
      where: {
        AND: [{ id }, { authorId: userId }],
      },
    });

    if (existingComment?.parentTicketId) {
      const projectId = await this.getProjectId(
        existingComment.parentTicketId,
        userId,
      );
      if (projectId) {
        this.eventEmitter.emit(COMMENT_DELETION_EVENT, {
          projectId,
          deletedBy: userId,
          commentId: id,
          ticketId: existingComment.parentTicketId,
        });
      }
    }

    return {
      message: 'updated successfully',
    };
  }
}
