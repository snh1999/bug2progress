import { ForbiddenException, Injectable } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
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
    private postService: PostService,
    private userService: UserService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    // if (dto.organizationId) {
    //   dto.organizationId = (
    //     await this.orgService.findOne(dto.organizationId)
    //   ).id;
    // }

    const { slug, ...projectData } = dto;

    return this.prisma.$transaction(async (prisma) => {
      const post = await this.postService.createBasePost(userId, dto.title, {
        slug,
      });

      return prisma.project.create({
        data: {
          ...projectData,
          ownerId: userId,
          basePostId: post.id,
        },
      });
    });
  }

  async findAll(userid?: string) {
    if (userid)
      return await this.prisma.project.findMany({
        where: {
          ownerId: userid,
        },
        orderBy: { createdAt: 'desc' },
      });
    return await this.prisma.project.findMany({});
  }

  async findOne(id: string) {
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

    return this.prisma.project.update({
      where: { id, ownerId: userId },
      data: { ...dto },
    });
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

    return {
      message: 'delete successful',
    };
  }

  async findContributor(url: string, role?: ProjectRole) {
    const project = await this.findOne(url);

    return this.prisma.projectContributor.findMany({
      where: {
        projectId: project.id,
        role,
      },
    });
  }

  async addContributor(id: string, dto: CreateContributorDto, userId: string) {
    const project = await this.checkPermission(id, userId);
    const contributorId = await this.userService.getIdFromUsername(
      dto.username,
    );

    return this.prisma.projectContributor.create({
      data: {
        userId: contributorId,
        projectId: project.id,
        role: dto.role,
      },
    });
  }

  async updateContributorRole(
    id: string,
    dto: UpdateContributorDto,
    userId: string,
  ) {
    const project = await this.checkPermission(id, userId);
    const contributorId = await this.userService.getIdFromUsername(
      dto.username,
    );

    return this.prisma.projectContributor.update({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: contributorId,
        },
      },
      data: { ...dto },
    });
  }

  async removeContributor(
    id: string,
    dto: DeleteContributorDto,
    userId: string,
  ) {
    const project = await this.checkPermission(id, userId);
    const contributorId = await this.userService.getIdFromUsername(
      dto.username,
    );

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
    const project = await this.findOne(projectId);

    if (project.ownerId != userId)
      throw new ForbiddenException('You are not authorized for the action');

    return project;
  }
}
