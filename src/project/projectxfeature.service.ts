import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ProjectFeatureDto } from './dto';
import { ProjectService } from './project.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProjectFeatureService {
  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService, // private userService: UserService, // private ticketService: TicketService,
  ) {}

  async findFeatures(id: string) {
    const project = await this.projectService.find(id);
    return this.prisma.projectXFeatures.findMany({
      where: {
        projectId: project.id,
      },
    });
  }

  async addFeature(
    id: string,
    featureId: string,
    userid: string,
    dto?: ProjectFeatureDto,
  ) {
    const project = await this.projectService.find(id);
    if (project.ownerId != userid)
      throw new UnauthorizedException(
        'Only Project owner can perform this action',
      );
    return this.prisma.projectXFeatures.create({
      data: {
        projectId: project.id,
        featuresId: featureId,
        ownerId: userid,
        featureType: dto ? dto.featureType : 'ACTIVE',
      },
    });
  }
  async removeFeature(id: string, featureId: string, userid: string) {
    const project = await this.projectService.find(id);
    if (project.ownerId != userid)
      throw new UnauthorizedException(
        'Only Project owner can perform this action',
      );
    await this.prisma.projectXFeatures.delete({
      where: {
        projectId_featuresId: {
          projectId: project.id,
          featuresId: featureId,
        },
      },
    });
    return {
      message: 'delete successful',
    };
  }
}
