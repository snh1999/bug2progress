import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/feature-create.dto';
import { UpdateFeatureDto } from './dto/feature-update.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guard';
import { GetUser } from '@/common/decorator';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';

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
