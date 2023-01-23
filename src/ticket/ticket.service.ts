import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import {
  CreateTicketDto,
  TicketAssignDto,
  TicketEnumDto,
  UpdateStatusDto,
  UpdateTicketDto,
} from './dto';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
    private userService: UserService,
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
        creatorId: userid,
      },
    });

    // create ticketroles
    try {
      await this.prisma.ticketRoles.create({
        data: {
          ticketId: ticket.id,
        },
      });
    } catch (error) {
      // delete
      await this.remove(ticket.id, userid);
      throw new InternalServerErrorException('Couldnot create ticket');
    }
    return ticket;
  }

  async findAll(projectId?: string) {
    if (projectId)
      return this.prisma.ticket.findMany({
        where: {
          projectId: projectId,
        },
      });
    return this.prisma.ticket.findMany({});
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

  async update(id: string, dto: UpdateTicketDto, userid: string) {
    return this.prisma.ticket.updateMany({
      where: {
        AND: [{ id }, { creatorId: userid }],
      },
      data: {
        ...dto,
      },
    });
  }

  // async updateRoles(id: string, dto: TicketRoles) {
  //   return await this.prisma.ticketRoles.update({
  //     where: {
  //       ticketId: id,
  //     },
  //     data: {
  //       ...dto,
  //     },
  //   });
  // }

  async updateTicketRoles(
    projectId: string,
    ticketid: string,
    dto: UpdateStatusDto | TicketEnumDto | TicketAssignDto,
    userId: string,
  ) {
    // check user role (if authorized)
    // if owner
    const project = await this.projectService.findOne(projectId);
    const userRole = await this.prisma.projectContributor.findFirst({
      where: {
        AND: [{ projectId: project.id }, { userId }],
      },
    });
    if (dto instanceof UpdateStatusDto && dto.ticketStatus == 'PENDING_CLOSE')
      await this.updateStatus(ticketid, dto, userId);
    // user is not lead/manager or owner
    if (!(project.ownerId == userId || userRole.role != 'DEVELOPER'))
      throw new UnauthorizedException('You are not owner or manager');

    // update role
    if (dto instanceof UpdateStatusDto)
      return this.updateStatus(ticketid, dto, userId);
    else if (dto instanceof TicketAssignDto) {
      const idToAssign = await this.userService.getIdFromUsername(dto.username);
      return this.assignTicket(ticketid, idToAssign, userId);
    } else if (dto instanceof TicketEnumDto) {
      return this.verifyTicket(ticketid, dto, userId);
    }
  }

  async remove(id: string, userid: string) {
    await this.prisma.ticket.deleteMany({
      where: {
        AND: [{ id }, { creatorId: userid }],
      },
    });
    return {
      message: 'delete successful',
    };
  }
  // !No verification DONE- HAVE TO BE CHECKED BEFORE FUNCTION IS CALLED
  async verifyTicket(id: string, dto: TicketEnumDto, userid: string) {
    await this.prisma.ticket.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });

    // find roles and check status - if pending, then proceed
    const ticketRoles = await this.prisma.ticketRoles.findUnique({
      where: {
        ticketId: id,
      },
    });

    if (ticketRoles.ticketStatus == TicketStatus.PENDING) {
      await this.prisma.ticketRoles.update({
        where: {
          ticketId: id,
        },
        data: {
          ticketStatus: TicketStatus.VERIFIED,
          varifierId: userid,
          varifiedAt: new Date(Date.now()),
        },
      });
    }
  }

  async assignTicket(id: string, idToAssign: string, userid: string) {
    await this.prisma.ticketRoles.update({
      where: {
        ticketId: id,
      },
      data: {
        ticketStatus: TicketStatus.ASSIGNED,
        developerId: idToAssign,
        assignedbyId: userid,
        assignedToAt: new Date(Date.now()),
      },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userid: string) {
    const ticketRoles = await this.prisma.ticketRoles.findUnique({
      where: {
        ticketId: id,
      },
    });

    // done working, ask to close
    if (
      dto.ticketStatus == TicketStatus.PENDING_CLOSE &&
      ticketRoles.ticketStatus == TicketStatus.ASSIGNED &&
      ticketRoles.developerId == userid
    ) {
      return this.prisma.ticketRoles.update({
        where: {
          ticketId: id,
        },
        data: {
          ticketStatus: dto.ticketStatus,
        },
      });
    } else if (dto.ticketStatus == TicketStatus.CLOSED) {
      return this.prisma.ticketRoles.update({
        where: {
          ticketId: id,
        },
        data: {
          ticketStatus: dto.ticketStatus,
          closedAt: new Date(Date.now()),
          closeId: userid,
        },
      });
    }
    throw new BadRequestException('Could not perform operation');
  }
}
