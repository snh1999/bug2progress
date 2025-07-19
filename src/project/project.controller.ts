import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, ContributorDto } from './dto';
import { ProjectRole } from '@prisma/client';
import { ProjectFeatureService } from './projectxfeature.service';
import { ProjectFeatureDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guard';
import { GetUser } from '@/common/decorator';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';

@ApiTags('Project')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseTransformInterceptor)
@Controller('projects')
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
  findAll(@GetUser('id') userid: string) {
    return this.projectService.findAll(userid);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userid: string) {
    return this.projectService.findOne(id, userid);
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

  @Get(':id/contributors')
  findContributor(
    @Param('id') id: string,
    @Query('role') role?: ProjectRole,
    @Query('userId') userId?: string,
  ) {
    return this.projectService.findContributor(id, role, userId);
  }

  @Post(':id/contributors')
  addContributor(
    @Param('id') id: string,
    @Body() dto: ContributorDto,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.addContributor(id, dto, userid);
  }

  @Post(':inviteCode/join')
  getInviteCode(
    @Param('inviteCode') inviteCode: string,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.joinWithInvite(inviteCode, userid);
  }

  @Patch(':id/contributors')
  updateContributor(
    @Param('id') id: string,
    @Body() dto: ContributorDto,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.updateContributorRole(id, dto, userid);
  }

  @Delete(':id/contributors/:contributorId')
  removeContributor(
    @Param('id') id: string,
    @Param('contributorId') contributorId: string,
    @GetUser('id') userid: string,
  ) {
    return this.projectService.removeContributor(id, contributorId, userid);
  }

  @Get(':id/features')
  findFeatures(@Param('id') id: string) {
    return this.projectFeatures.findFeatures(id);
  }

  @Post(':id/features/:featureId')
  addFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
    @GetUser('id') userid: string,
    @Body() dto?: ProjectFeatureDto,
  ) {
    return this.projectFeatures.addFeature(id, featureId, userid, dto);
  }

  @Delete(':id/features/:featureId')
  removeFeature(
    @Param('id') id: string,
    @Param('featureId') featureId: string,
    @GetUser('id') userid: string,
  ) {
    return this.projectFeatures.removeFeature(id, featureId, userid);
  }
}
