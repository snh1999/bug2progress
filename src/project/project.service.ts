import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Project, ProjectRole } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
// import { HandlePrismaDuplicateError } from '../common/interceptor/handle.prisma-error';
import { OrganizationService } from '../organization/organization.service';
import { PostService } from '../post/post.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateContributorDto,
  UpdateContributorDto,
  DeleteContributorDto,
} from './dto';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private orgService: OrganizationService,
    private postService: PostService,
    private userService: UserService,
  ) {}

  // TODO- check organization id at frontend?
  async create(dto: CreateProjectDto, userId: string) {
    // let slug;
    // if (dto.slug) {
    //   slug = dto.slug;
    //   delete dto.slug;
    // }

    if (dto.organizationId) {
      dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    }
    if (dto.slug) delete dto.slug;

    // add a new post as well with base post
    // this.prisma.project.create({
    //   data: {
    //     title: dto.title,
    //     summary: dto.summary,
    //     organizationId: dto.organizationId,
    //     urlid: dto.urlid,
    //     ownerId: userId,
    //     basePost: {
    //       create: {
    //         title: dto.title,
    //         postContent: `This post is automatically genereted for Project ${dto.title}.`,
    //         authorId: userId,
    //         // slug,
    //       },
    //     },
    //   },
    // });
    const post = await this.postService.createBasePost(userId, dto.title);
    let project: Project;
    try {
      project = await this.prisma.project.create({
        data: {
          basePostId: post.id,
          ...dto,
          ownerId: userId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        await this.postService.remove(post.id, userId);
      // new HandlePrismaDuplicauteError(error, 'urlid');
    }

    return project;
  }

  async findAll(userid?: string) {
    if (userid)
      return await this.prisma.project.findMany({
        where: {
          ownerId: userid,
        },
      });
    return await this.prisma.project.findMany({});
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [
          {
            id,
          },
          {
            urlid: id,
          },
        ],
      },
    });
    if (!project) throw new NotFoundException('404 Not found');
    return project;
  }

  // TODO- check organization id at frontend?
  async update(id: string, dto: UpdateProjectDto, userid: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    }
    const project = await this.findOne(id);
    return this.prisma.project.updateMany({
      where: {
        AND: [{ id: project.id }, { ownerId: userid }],
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userid: string) {
    const project = await this.findOne(id);
    if (project.ownerId != userid)
      throw new UnauthorizedException('User not owner');
    await this.prisma.post.delete({
      where: {
        id: project.basePostId,
      },
    });
    // await this.prisma.project.delete({
    //   where: {
    //     id: project.id,
    //   },
    // });
    return {
      message: 'delete successful',
    };
  }

  async findContributor(url: string, role?: ProjectRole) {
    const project = await this.findOne(url);
    if (role)
      return this.prisma.projectContributor.findMany({
        where: {
          AND: [{ projectId: project.id }, { role }],
        },
      });
    return this.prisma.projectContributor.findMany({
      where: {
        projectId: project.id,
      },
    });
  }

  // TODO - check userid at frontend?
  async createContributor(
    url: string,
    dto: CreateContributorDto,
    userid: string,
  ) {
    const project = await this.findOne(url);
    const idtoadd = await this.userService.getIdFromUsername(dto.username);
    if (project.ownerId != userid)
      throw new UnauthorizedException('You are not authorized for the action');

    return this.prisma.projectContributor.create({
      data: {
        userId: idtoadd,
        projectId: project.id,
        role: dto.role,
      },
    });
  }

  async updateContributor(
    url: string,
    dto: UpdateContributorDto,
    userid: string,
  ) {
    const project = await this.findOne(url);
    const idtoadd = await this.userService.getIdFromUsername(dto.username);
    if (project.ownerId != userid)
      throw new UnauthorizedException('You are not authorized for the action');

    return await this.prisma.projectContributor.update({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: idtoadd,
        },
      },
      data: {
        role: dto.role,
      },
    });
  }

  async removeContributor(
    url: string,
    dto: DeleteContributorDto,
    userid: string,
  ) {
    const project = await this.findOne(url);
    const idtoadd = await this.userService.getIdFromUsername(dto.username);
    if (project.ownerId != userid)
      throw new UnauthorizedException('You are not authorized for the action');

    await this.prisma.projectContributor.delete({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: idtoadd,
        },
      },
    });

    return {
      message: 'Delete successful',
    };
  }
}
