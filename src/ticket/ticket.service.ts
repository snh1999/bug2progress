import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectService } from 'src/project/project.service';
import { CreateTicketDto, UpdateTicketDto, TicketRoles } from './dto';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
  ) {}
  async create(dto: CreateTicketDto, userid: string) {
    // create ticket
    if (dto.projectId) {
      const project = await this.projectService.findOne(dto.projectId);
      dto.projectId = project.id;
    }
    // check feature x project

    // create ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        ...dto,
      },
    });

    // create ticketroles
    try {
      await this.prisma.ticketRoles.create({
        data: {
          ticketId: ticket.id,
          creatorId: userid,
        },
      });
    } catch (error) {
      // delete
      await this.remove(ticket.id);
      throw new InternalServerErrorException('Couldnot create ticket');
    }
    return ticket;
  }

  async findAll(projectId: string) {
    return await this.prisma.ticket.findMany({
      where: {
        projectId: projectId,
      },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: {
        id,
      },
      include: {
        ticketRoles: true,
      },
    });
    if (!ticket) throw new NotFoundException('404 not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    return await this.prisma.ticket.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async updateRoles(id: string, dto: TicketRoles) {
    return await this.prisma.ticketRoles.update({
      where: {
        ticketId: id,
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.ticket.delete({
      where: {
        id,
      },
    });
    return {
      message: 'delete successful',
    };
  }
}
