import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { PostService } from '../post/post.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { CreateProjectDto, UpdateProjectDto, ContributorDto } from './dto';
import { generateRandomString } from '@/utils/hashedString';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PROJECT_DELETION_EVENT,
  PROJECT_UPDATE_EVENT,
} from '@/websocket/events.constant';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private postService: PostService,
    private userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    // if (dto.organizationId) {
    //   dto.organizationId = (
    //     await this.orgService.findOne(dto.organizationId)
    //   ).id;
    // }

    const { postContent, ...projectData } = dto;

    return this.prisma.$transaction(async (prisma) => {
      const post = await this.postService.createBasePost(userId, dto.title, {
        postContent,
      });

      return prisma.project.create({
        data: {
          ...projectData,
          ownerId: userId,
          inviteCode: await generateRandomString(),
          basePostId: post.id,
        },
      });
    });
  }

  async findAll(userid?: string) {
    if (userid)
      return await this.prisma.project.findMany({
        where: {
          OR: [{ ownerId: userid }, { members: { some: { userId: userid } } }],
        },
        orderBy: { createdAt: 'desc' },
      });
    return await this.prisma.project.findMany({});
  }

  async findOne(id: string, userid: string) {
    const project = await this.find(id);
    return this.prisma.project.findFirstOrThrow({
      where: {
        id: project.id,
        OR: [{ ownerId: userid }, { members: { some: { userId: userid } } }],
      },
      include: { basePost: true },
    });
  }

  async find(id: string) {
    return this.prisma.project.findFirstOrThrow({
      where: {
        OR: [{ id }, { urlid: id }],
      },
      include: { basePost: true },
    });
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    // if (dto.organizationId) {
    //   dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    // }
    await this.checkPermission(id, userId);

    const { postContent, updateInviteCode, ...projectData } = dto;

    if (updateInviteCode)
      if (postContent !== undefined) {
        await this.postService.update(id, { postContent }, userId);
      }

    const updatedProject = await this.prisma.project.update({
      where: { id, ownerId: userId },
      data: {
        ...projectData,
        inviteCode: updateInviteCode ? await generateRandomString() : undefined,
      },
    });

    this.eventEmitter.emit(PROJECT_UPDATE_EVENT, {
      projectId: id,
      updatedBy: userId,
      project: updatedProject,
    });

    return updatedProject;
  }

  async remove(id: string, userId: string) {
    const project = await this.checkPermission(id, userId);

    await this.prisma.$transaction([
      this.prisma.project.delete({
        where: { id: project.id },
      }),
      this.prisma.post.delete({
        where: { id: project.basePostId },
      }),
    ]);

    this.eventEmitter.emit(PROJECT_DELETION_EVENT, {
      projectId: id,
      deletedBy: userId,
    });

    return {
      message: 'delete successful',
    };
  }

  async joinWithInvite(inviteCode: string, userId: string) {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { inviteCode },
    });

    const contributor = await this.prisma.projectContributor.findFirst({
      where: {
        projectId: project.id,
        userId,
      },
    });

    if (contributor) {
      throw new BadRequestException('You have already joined this project');
    }

    return this.prisma.projectContributor.create({
      data: {
        userId,
        projectId: project.id,
        role: ProjectRole.DEVELOPER,
      },
    });
  }

  async findContributor(project: string, role?: ProjectRole, userId?: string) {
    const existingProject = await this.find(project);

    return this.prisma.projectContributor.findMany({
      where: {
        projectId: existingProject.id,
        role,
        userId,
      },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async addContributor(id: string, dto: ContributorDto, userId: string) {
    const project = await this.checkPermission(id, userId);
    const contributorId = await this.userService.getIdFromUser(dto.userId);

    return this.prisma.projectContributor.create({
      data: {
        userId: contributorId,
        projectId: project.id,
        role: dto.role,
      },
    });
  }

  async updateContributorRole(id: string, dto: ContributorDto, userId: string) {
    const project = await this.checkPermission(id, userId);
    const contributorId = await this.userService.getIdFromUser(dto.userId);

    return this.prisma.projectContributor.update({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: contributorId,
        },
      },
      data: { role: dto.role },
    });
  }

  async removeContributor(id: string, contributor: string, userId: string) {
    const project = await this.checkPermission(id, userId);
    const contributorId = await this.userService.getIdFromUser(contributor);

    await this.prisma.projectContributor.delete({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: contributorId,
        },
      },
    });

    return { message: 'Delete successful' };
  }

  async checkPermission(projectId: string, userId: string) {
    const project = await this.find(projectId);

    if (project.ownerId != userId)
      throw new ForbiddenException('You are not authorized for the action');

    return project;
  }
}
