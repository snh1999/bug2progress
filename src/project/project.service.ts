import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { HandlePrismaDuplicateError } from 'src/common/interceptor/handle.prisma-error';
import { OrganizationService } from 'src/organization/organization.service';
import { PostService } from 'src/post/post.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private orgService: OrganizationService,
    private postService: PostService,
  ) {}
  async create(dto: CreateProjectDto, userId: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.checkOrgId(dto.organizationId);
    }
    // add a new post as well with base post
    const post = await this.postService.createBasePost(
      userId,
      dto.title,
      dto.summary,
    );
    let project: Project;
    try {
      project = await this.prisma.project.create({
        data: {
          ...dto,
          basePostId: post.id,
          ownerId: userId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        new HandlePrismaDuplicateError(error, 'urlid');
    }

    // if (!project.urlid) this.update(post.id, { urlid: project.urlid }, userId);
    return {
      message: 'created successfully',
      url: '/project/' + project.id,
      postid: post.id,
    };
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

  async update(id: string, dto: UpdateProjectDto, userid: string) {
    if (dto.organizationId) {
      dto.organizationId = await this.orgService.getOrgId(dto.organizationId);
    }
    const project = await this.findOne(id);
    await this.prisma.project.updateMany({
      where: {
        id: project.id,
        ownerId: userid,
      },
      data: {
        ...dto,
      },
    });
    return {
      message: 'updated successfully',
      url: '/project/' + project.id,
    };
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    // await this.prisma.post.delete({
    //   where: {
    //     id: project.basePostId,
    //   },
    // });
    await this.prisma.project.delete({
      where: {
        id: project.id,
      },
    });
    return `This action removes a #${id} project`;
  }

  // change project status

  async checkOrgId(urlOrId: string) {
    try {
      return await this.orgService.getOrgId(urlOrId);
    } catch (error) {
      throw new BadRequestException('Incorrect Organization Name');
    }
  }
}
