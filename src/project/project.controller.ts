import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateContributorDto,
  UpdateContributorDto,
  DeleteContributorDto,
} from './dto';
import { ProjectRole } from '@prisma/client';
import { ProjectFeatureService } from './projectxfeature.service';
import { ProjectFeatureDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guard';
import { GetUser } from '@/common/decorator';

@ApiTags('Project')
@UseGuards(JwtAuthGuard)
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectFeatures: ProjectFeatureService,
  ) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @GetUser('id') userid: string) {
    return this.projectService.create(dto, userid);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id/contributors')
  findContributor(
    @Param('id') id: string,
    @Body() dto?: { role: ProjectRole },
  ) {
    if (dto) return this.projectService.findContributor(id, dto.role);
    return this.projectService.findContributor(id);
  }

  @Post(':id/contributors')
  createContributor(
    @Param('id') id: string,
    @Body() dto: CreateContributorDto,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.createContributor(id, dto, userid);
  }

  @Patch(':id/contributors')
  updateContributor(
    @Param('id') id: string,
    @Body() dto: UpdateContributorDto,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.updateContributor(id, dto, userid);
  }

  @Delete(':id/contributors')
  removeContributor(
    @Param('id') id: string,
    @Body() dto: DeleteContributorDto,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.removeContributor(id, dto, userid);
  }

  @Get(':id/features')
  findFeatures(@Param('id') id: string) {
    return this.projectFeatures.findFeatures(id);
  }

  // TODO- add features option will lead to all features page
  @Post(':id/features/:featureId')
  addFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
    @GetUser('id') userid: string,
    @Body() dto?: ProjectFeatureDto,
  ) {
    return this.projectFeatures.addFeature(id, featureId, userid, dto);
  }
  // TODO- sort features stuff (Make new Copy for each project and No empty features), Update enabled

  @Delete(':id/features/:featureId')
  removeFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
    @GetUser('id') userid: string,
  ) {
    return this.projectFeatures.removeFeature(id, featureId, userid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.update(id, dto, userid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userid: string) {
    return this.projectService.remove(id, userid);
  }
}
