import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Organization, OrganizationRoles } from '@prisma/client';
import { HandlePrismaDuplicateError } from 'src/common/interceptor/handle.prisma-error';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  // ############################## create organization ############################
  async create(createOrganizationDto: CreateOrganizationDto, userid: string) {
    let org: Organization, roles: OrganizationRoles;
    try {
      org = await this.prisma.organization.create({
        data: {
          ...createOrganizationDto,
          updateLog: ' ',
          members: {
            connect: {
              id: userid,
            },
          },
        },
      });
    } catch (error) {
      new HandlePrismaDuplicateError(error, 'url id');
    }
    // create org roles
    try {
      roles = await this.prisma.organizationRoles.create({
        data: {
          orgId: org.id,
          ownerId: userid,
        },
      });
    } catch (error) {
      // error creating role, delete organization
      await this.prisma.organization.delete({
        where: {
          id: org.id,
        },
      });
    }

    return {
      ...org,
      ...roles,
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
        URLId: orgid,
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
  async findMembers(orgid: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        URLId: orgid,
      },
      include: {
        members: {
          select: {
            profile: {
              select: {
                name: true,
                username: true,
                photo: true,
              },
            },
          },
        },
      },
    });
    // org.members.forEach((member) => {
    //   console.log(member);
    // });
    return { ...org.members };
  }
  // ############################# view posts #############################
  async findPosts(orgid: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        URLId: orgid,
      },
      include: {
        post: true,
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org.post;
  }
  // ############################# view projects #############################
  async findProjects(orgid: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        URLId: orgid,
      },
      include: {
        project: true,
      },
    });
    if (!org) return new NotFoundException('404 Not found');
    return org.project;
  }
  // ############################# update details organization #########################
  // get orgRoles
  async getOrgRoles(orgid: string) {
    const orgRoles = await this.prisma.organization.findUnique({
      where: {
        URLId: orgid,
      },
      select: {
        organizationRoles: {
          select: {
            ownerId: true,
            admin: { select: { id: true } },
            moderator: { select: { id: true } },
          },
        },
      },
    });
    return orgRoles.organizationRoles;
  }

  // nothing = admin
  // admin = admin + owner
  // moderator = admin + owner + moderators
  async isUserAuthorized(orgId, userid, authorizedPerson?: string) {
    const orgRoles = await this.getOrgRoles(orgId);
    if (
      userid == orgRoles.ownerId ||
      // admin is authorized and user is admin
      (authorizedPerson == 'admin' &&
        orgRoles.admin.includes({ id: userid })) ||
      // moderator is authorized and user is admin/moderator
      (authorizedPerson == 'moderator' &&
        (orgRoles.admin.includes({ id: userid }) ||
          orgRoles.moderator.includes({ id: userid })))
    ) {
      return;
    }
    throw new UnauthorizedException(
      'You are not authorized to perform this action',
    );
  }
  // ############################# update details organization (admin/owner can) #########################
  async update(
    orgid: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userid: string,
  ) {
    await this.isUserAuthorized(orgid, userid, 'admin');
    // user is authorized- update org
    const org = await this.prisma.organization.update({
      where: {
        URLId: orgid,
      },
      data: {
        ...updateOrganizationDto,
      },
    });
    return org;
  }

  // ############################# delete organization (only owner can) #########################
  async remove(orgid: string, userid: string) {
    await this.isUserAuthorized(orgid, userid, 'owner');
    await this.deleteOrgByUrlId(orgid);
    return {
      message: 'Organization deleted successfully',
    };
  }
  async deleteOrgByUrlId(orgid: string) {
    await this.prisma.organization.delete({
      where: {
        URLId: orgid,
      },
    });
  }
  // ############################# add admin (OWNER) ###########################
  async addNewAdmin(orgid, dto, userid) {
    // await this.isUserAuthorized(orgid, userid, 'owner');
    // const id = await this.findIdFromUrl(orgid);
    // const admins = await this.prisma.organizationRoles.findUnique({
    //   where: { orgId: id },
    //   select: {
    //     admin: {
    //       select: {
    //         id: true,
    //       },
    //     },
    //   },
    // });
    // admin;
    // const res = await prisma.content.findOne({
    //   where: { id: 1 },
    //   select: {
    //     child_ids: true,
    //   },
    // })
  }
  // ############################# remove admin (ADMIN) ###########################

  // ############################# add moderator ###########################
  // ############################# remove moderator ########################

  // ############################# join organization ##########################
  async joinOrganization(orgid: string, userid: string) {
    // // this action will make you leave your organization
    // const org = this.findIdFromUrl(orgid);
    // //  if user is part of any organization - leave
    // const user = await this.prisma.user.findFirst({
    //   where: {
    //     id: userid,
    //     isAdmin: false,
    //   },
    // });
    // await this.prisma.user.update({
    //   where: {
    //     id: userid,
    //   },
    //   data: {
    //     organizationId: orgid,
    //     isAdmin: false,
    //     isModerator: false,
    //   },
    // });
    // return {
    //   message: 'joined successfully',
    // };
  }
  // ############################# remove member (by admin/moderator) ##########################

  // ############################# find id from url ##########################
  async findIdFromUrl(url: string) {
    const org = await this.prisma.organization.findUnique({
      where: {
        URLId: url,
      },
      select: {
        id: true,
      },
    });
    return org.id;
  }
}
