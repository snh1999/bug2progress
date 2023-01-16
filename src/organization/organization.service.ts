import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { HandlePrismaDuplicateError } from 'src/common/interceptor/handle.prisma-error';
import { UserService } from 'src/user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import * as ORG from './permissions';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  // ############################## create organization ############################
  async create(dto: CreateOrganizationDto, userid: string) {
    let org: Organization;
    try {
      org = await this.prisma.organization.create({
        data: {
          ...dto,
          updateLog: ' ',
          ownerId: userid,
        },
      });
    } catch (error) {
      new HandlePrismaDuplicateError(error, 'urlid');
    }
    return {
      message: 'succesfully created',
      url: '/organization/' + org.urlid,
    };
  }

  // ############################ view all organization ############################
  async findAll() {
    const orgAll = await this.prisma.organization.findMany({});
    return {
      ...orgAll,
    };
  }

  // #################################### BY ID (o/:id) #############################
  // ############################# view organization by id #########################
  async findOne(orgid: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: orgid,
      },
      include: {
        project: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        post: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org;
  }
  // ############################# view all members of org #########################
  async viewAllMembers(orgurl: string) {
    // using another model, so we have to get the ID
    const orgId = await this.getOrgId(orgurl);
    return await this.prisma.orgMembers.findMany({
      where: {
        organizationId: orgId,
      },
      select: {
        user: {
          select: {
            profile: {
              select: {
                username: true,
                name: true,
                photo: true,
              },
            },
          },
        },
        memberType: true,
      },
    });
  }
  // ############################# view posts #############################
  async findPosts(orgurl: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: orgurl,
      },
      include: {
        post: true,
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org.post;
  }
  // ############################# view projects #############################
  async findProjects(orgurl: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: orgurl,
      },
      include: {
        project: true,
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org.project;
  }

  // ############################# update details organization (admin/owner can) #########################
  async update(
    orgurl: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userid: string,
  ) {
    // organization not found handled here
    await this.isUserAuthorized(orgurl, userid, ORG.UPDATE_PERMISSION);
    // user is authorized- update org
    const org = await this.prisma.organization.update({
      where: {
        urlid: orgurl,
      },
      data: {
        ...updateOrganizationDto,
      },
    });
    return {
      message: 'updated successfully',
      url: 'organization/' + org.urlid,
    };
  }

  // ############################# delete organization (only owner can) #########################
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
  // ############################# view all admin ############################
  async viewAllAdmin(orgurl: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: orgurl,
      },
      select: {
        members: {
          where: {
            memberType: 'ADMIN',
          },
          select: {
            user: {
              select: {
                profile: {
                  select: {
                    username: true,
                    name: true,
                    photo: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org.members;
  }
  // ############################# add admin (OWNER) ###########################
  async addNewAdmin(orgurl: string, userToAdd: string, userid: string) {
    await this.isUserAuthorized(orgurl, userid, ORG.NEW_ADMIN_PERMISSION);
    const idToAdd = await this.userService.getIdFromUsername(userToAdd);
    if (!idToAdd) return new BadRequestException('Invalid username');
    const orgId = await this.getOrgId(orgurl);
    try {
      const member = await this.prisma.orgMembers.update({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: idToAdd,
          },
        },
        data: {
          memberType: 'ADMIN',
        },
      });
      return member;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        throw new BadRequestException('No such member in the Organization');
      else {
        throw new BadRequestException(error.message);
      }
    }
  }
  // ############################# remove admin (ADMIN) ###########################
  async removeAdmin(orgurl: string, userToAdd: string, userid: string) {
    await this.isUserAuthorized(orgurl, userid, ORG.REMOVE_ADMIN_PERMISSION);
    return await this.changeToMember(orgurl, userToAdd);
  }

  async changeToMember(orgurl: string, userToAdd: string) {
    const idToAdd = await this.userService.getIdFromUsername(userToAdd);
    if (!idToAdd) return new BadRequestException('Invalid username');
    const orgId = await this.getOrgId(orgurl);
    try {
      const member = await this.prisma.orgMembers.update({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: idToAdd,
          },
        },
        data: {
          memberType: 'MEMBER',
        },
      });
      return member;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        throw new BadRequestException('No such admin in the Organization');
      else {
        throw new BadRequestException(error.message);
      }
    }
  }

  // ############################# view all moderator ############################
  async viewAllModerator(orgurl: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        urlid: orgurl,
      },
      select: {
        members: {
          where: {
            memberType: 'MODERATOR',
          },
          select: {
            user: {
              select: {
                profile: {
                  select: {
                    username: true,
                    name: true,
                    photo: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return org.members;
  }
  // ############################# add moderator ###########################
  async addNewModerator(orgurl: string, userToAdd: string, userid: string) {
    await this.isUserAuthorized(orgurl, userid, ORG.NEW_MODERATOR_PERMISSION);
    const idToAdd = await this.userService.getIdFromUsername(userToAdd);
    if (!idToAdd) return new BadRequestException('Invalid username');
    const orgId = await this.getOrgId(orgurl);
    try {
      const member = await this.prisma.orgMembers.update({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: idToAdd,
          },
        },
        data: {
          memberType: 'MODERATOR',
        },
      });
      return member;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        throw new BadRequestException('No such member in the Organization');
      else {
        throw new BadRequestException(error.message);
      }
    }
  }
  // ############################# remove moderator ########################
  async removeModerator(orgurl: string, userToAdd: string, userid: string) {
    await this.isUserAuthorized(
      orgurl,
      userid,
      ORG.REMOVE_MODERATOR_PERMISSION,
    );
    return await this.changeToMember(orgurl, userToAdd);
  }

  // ############################# join organization ##########################
  async joinOrganization(orgurl: string, userid: string) {
    const organizationId = await this.getOrgId(orgurl);
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
      throw new BadRequestException(error.message);
    }
    return {
      message: 'Joined Organization successfully',
    };
  }

  // ############################# leave organization ##########################
  async leaveOrganization(orgurl: string, userid: string) {
    const organizationId = await this.getOrgId(orgurl);
    try {
      await this.prisma.orgMembers.delete({
        where: {
          organizationId_userId: {
            organizationId: organizationId,
            userId: userid,
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('User is not a member of organization');
      }
      throw new BadRequestException(error.message);
    }
    return {
      message: 'Left Organization successfully',
    };
  }
  // ############################# remove member (by admin/moderator) ##########################
  async removeMember(orgid: string, userToRemove: string, userid: string) {
    await this.isUserAuthorized(orgid, userid, ORG.REMOVE_MEMBER_PERMISSION);

    const idToRemove = await this.userService.getIdFromUsername(userToRemove);
    const organizationId = await this.getOrgId(orgid);
    try {
      await this.prisma.orgMembers.delete({
        where: {
          organizationId_userId: {
            organizationId: organizationId,
            userId: idToRemove,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Somthing went wrong, couldnot remove user',
      );
    }
    // remove admin/moderator as well

    return {
      message: 'Removed User successfully',
    };
  }

  // ############################# find id from url ##########################
  async getOrgId(urlOrId: string) {
    const org = await this.prisma.organization.findFirst({
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
      select: {
        id: true,
      },
    });
    if (!org) throw new NotFoundException('404 Not found');
    return org.id;
  }

  // ############################# helper functions ##########################
  async getModeratorIds(orgurl: string) {
    const orgRoles = await this.prisma.organization.findUnique({
      where: {
        urlid: orgurl,
      },
      select: {
        members: {
          where: {
            memberType: 'MODERATOR',
          },
        },
      },
    });
    return orgRoles.members;
  }
  async getAdminIds(orgurl: string) {
    const orgRoles = await this.prisma.organization.findUnique({
      where: {
        urlid: orgurl,
      },
      select: {
        members: {
          where: {
            memberType: 'ADMIN',
          },
          select: {
            userId: true,
          },
        },
      },
    });
    return orgRoles.members;
  }

  async getOwnerId(orgurl: string) {
    const orgRoles = await this.prisma.organization.findUnique({
      where: {
        urlid: orgurl,
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
  async isUserAuthorized(orgurl, userid, authorizedPerson?: ORG.OrgRoles) {
    if (userid == (await this.getOwnerId(orgurl))) return;
    else if (authorizedPerson == ORG.OrgRoles.ADMIN) {
      const adminObj = await this.getAdminIds(orgurl);
      if (this.checkElementAtObj(adminObj, userid)) return;
    } else if (authorizedPerson == ORG.OrgRoles.MODERATOR) {
      const adminObj = await this.getAdminIds(orgurl);
      const modObj = await this.getAdminIds(orgurl);
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

  checkElementAtObj(arrObj: any, value) {
    let ret: boolean;
    arrObj.forEach((element) => {
      if (element.userId == value) {
        ret = true;
        return;
      }
      ret = false;
    });
    return ret;
  }
}
