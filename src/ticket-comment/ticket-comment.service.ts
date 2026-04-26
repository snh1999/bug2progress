import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketCommentDto, UpdateTicketCommentDto } from './dto';

@Injectable()
export class TicketCommentService {
  constructor(private prisma: PrismaService) {}

  // check if ticketid is valid @ frontend
  create(ticketid: string, dto: CreateTicketCommentDto, userid: string) {
    // author comes from @GetUser and text contained in dto
    return this.prisma.ticketComment.create({
      data: {
        ...dto,
        parentTicketId: ticketid,
        authorId: userid,
      },
    });
  }

  findAll(ticketid: string) {
    return this.prisma.ticketComment.findMany({
      where: {
        parentTicketId: ticketid,
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

  update(id: string, dto: UpdateTicketCommentDto, userid: string) {
    return this.prisma.ticketComment.updateMany({
      where: {
        AND: [{ id }, { authorId: userid }],
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userid: string) {
    await this.prisma.ticketComment.deleteMany({
      where: {
        AND: [{ id }, { authorId: userid }],
      },
    });
    return {
      message: 'updated successfully',
    };
  }
}