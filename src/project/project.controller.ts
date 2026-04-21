import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { GetUser } from '@/common/decorator';
import { JwtAuthGuard } from '@/common/guard';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';
import { ContributorDto, CreateProjectDto, UpdateProjectDto } from './dto';
import { ProjectService } from './project.service';

@ApiTags('Project')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseTransformInterceptor)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

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
}
