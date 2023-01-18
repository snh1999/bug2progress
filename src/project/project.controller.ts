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
import { JwtAuthGuard } from 'src/common/guard';
import { GetUser } from 'src/common/decorator';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateContributorDto,
  UpdateContributorDto,
  DeleteContributorDto,
} from './dto';

@UseGuards(JwtAuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @GetUser('id') userid: string) {
    return this.projectService.create(dto, userid);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id/contributors')
  findContributor(@Param('id') id: string) {
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
