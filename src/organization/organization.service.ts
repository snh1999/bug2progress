import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChangeMemberRoleDto,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto';
import * as ORG from './permissions';
import { MemberType } from '@prisma/client';
import { UserService } from '@/user/user.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(dto: CreateOrganizationDto, userid: string) {
    return this.prisma.organization.create({
      data: {
        ...dto,
        updateLog: ' ',
        ownerId: userid,
      },
    });
  }
  // TODO - add updatelog and update org
  async findAll() {
    const orgAll = await this.prisma.organization.findMany({});
    return {
      ...orgAll,
    };
  }

  findOne(urlOrId: string) {
    return this.prisma.organization.findFirstOrThrow({
      where: {
        OR: [
          {
            urlid: urlOrId,
          },
          {
            id: urlOrId,
          },
        ],
      },
    });
  }

  async viewAllMembers(orgUrl: string) {
    const orgId = await this.getOrgId(orgUrl);
    return this.prisma.orgMembers.findMany({
      where: {
        organizationId: orgId,
      },
      select: {
        user: true,
        memberType: true,
      },
    });
  }
  async viewMembersByRole(orgUrl: string, memberType: MemberType) {
    const orgId = await this.getOrgId(orgUrl);
    return this.prisma.orgMembers.findMany({
      where: {
        AND: [{ organizationId: orgId }, { memberType }],
      },
      select: {
        user: true,
      },
    });
  }

  async findPosts(orgUrl: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: orgUrl,
      },
      include: {
        post: true,
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org.post;
  }
  async findProjects(orgUrl: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: orgUrl,
      },
      include: {
        project: true,
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org.project;
  }

  async update(
    orgUrl: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userid: string,
  ) {
    // organization not found handled here
    await this.isUserAuthorized(orgUrl, userid, ORG.UPDATE_PERMISSION);
    // user is authorized- update org
    return this.prisma.organization.update({
      where: {
        urlid: orgUrl,
      },
      data: {
        ...updateOrganizationDto,
      },
    });
  }

  async remove(orgid: string, userid: string) {
    // username to id
    await this.isUserAuthorized(orgid, userid, ORG.DELETE_PERMISSION);
    await this.prisma.organization.delete({
      where: {
        urlid: orgid,
      },
    });
    return {
      message: 'Deleted successfully',
    };
  }

  async changeMemberRole(
    orgUrl: string,
    dto: ChangeMemberRoleDto,
    userid: string,
  ) {
    if (dto.role == 'ADMIN')
      await this.isUserAuthorized(orgUrl, userid, ORG.ADMIN_PERMISSION);
    else if (dto.role == 'MODERATOR')
      await this.isUserAuthorized(orgUrl, userid, ORG.MODERATOR_PERMISSION);

    const idToAdd = await this.userService.getIdFromUser(dto.userName);
    if (!idToAdd) return new NotFoundException('Invalid username');
    const orgId = await this.getOrgId(orgUrl);

    return this.prisma.orgMembers.update({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: idToAdd,
        },
      },
      data: {
        memberType: dto.role,
      },
    });
  }

  async joinOrganization(orgUrl: string, userid: string) {
    const organizationId = await this.getOrgId(orgUrl);
    // check if it is owner
    try {
      await this.prisma.orgMembers.create({
        data: {
          organizationId: organizationId,
          userId: userid,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2002'
      ) {
        throw new BadRequestException('User already member of organization');
      }
      throw new BadRequestException(error);
    }
    return {
      message: 'Joined Organization successfully',
    };
  }

  async removeMember(orgUrl: string, userid: string) {
    const organizationId = await this.getOrgId(orgUrl);
    await this.prisma.orgMembers.delete({
      where: {
        organizationId_userId: {
          organizationId: organizationId,
          userId: userid,
        },
      },
    });

    return {
      message: 'User No longer part of Organization',
    };
  }
  async removeMemberBy(orgUrl: string, userToRemove: string, userid: string) {
    await this.isUserAuthorized(orgUrl, userid, ORG.REMOVE_MEMBER_PERMISSION);

    const idToRemove = await this.userService.getIdFromUser(userToRemove);
    return this.removeMember(orgUrl, idToRemove);
  }

  async getOrgId(urlOrId: string) {
    const org = await this.findOne(urlOrId);
    return org.id;
  }

  async getMemberIdsByRole(orgUrl: string, memberType: MemberType) {
    const orgRoles = await this.prisma.organization.findUnique({
      where: {
        urlid: orgUrl,
      },
      select: {
        members: {
          where: {
            memberType,
          },
        },
      },
    });
    return orgRoles?.members;
  }

  async getOwnerId(orgUrl: string) {
    const orgRoles = await this.prisma.organization.findUnique({
      where: {
        urlid: orgUrl,
      },
      select: {
        ownerId: true,
      },
    });
    if (!orgRoles) return new NotFoundException('404 Not found');

    return orgRoles.ownerId;
  }

  // nothing = admin
  // admin = admin + owner
  // moderator = admin + owner + moderators
  async isUserAuthorized(
    orgUrl: string,
    userid: string,
    authorizedPerson?: ORG.OrgRoles,
  ) {
    if (userid == (await this.getOwnerId(orgUrl))) return;
    else if (authorizedPerson == ORG.OrgRoles.ADMIN) {
      const adminObj = await this.getMemberIdsByRole(orgUrl, MemberType.ADMIN);
      if (this.checkElementAtObj(adminObj, userid)) return;
    } else if (authorizedPerson == ORG.OrgRoles.MODERATOR) {
      const adminObj = await this.getMemberIdsByRole(orgUrl, MemberType.ADMIN);
      const modObj = await this.getMemberIdsByRole(
        orgUrl,
        MemberType.MODERATOR,
      );
      if (
        this.checkElementAtObj(adminObj, userid) ||
        this.checkElementAtObj(modObj, userid)
      )
        return;
    }
    throw new UnauthorizedException(
      'You are not authorized to perform this action',
    );
  }

  checkElementAtObj(arrObj: any, value: string) {
    // let ret: boolean;
    arrObj.forEach((element: any) => {
      if (element.userId === value) {
        // ret = true;
        return;
      }
      // ret = false;
    });
    return true;
  }
}
