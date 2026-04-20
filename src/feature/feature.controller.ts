import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/common/decorator';
import { JwtAuthGuard } from '@/common/guard';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';
import type { CreateFeatureDto } from './dto/feature-create.dto';
import type { UpdateFeatureDto } from './dto/feature-update.dto';
import type { FeatureService } from './feature.service';

@ApiTags('Features')
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  create(
    @Body() dto: CreateFeatureDto,
    @Param('projectId') projectId: string,
    @GetUser('id') userid: string,
  ) {
    return this.featureService.create(projectId, dto, userid);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.featureService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFeatureDto,
    @GetUser('id') userid: string,
  ) {
    return this.featureService.update(id, dto, userid);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @GetUser('id') userid: string,
  ) {
    return this.featureService.remove(id, projectId, userid);
  }
}
