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
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/feature-create.dto';
import { UpdateFeatureDto } from './dto/feature-update.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guard';
import { GetUser } from '@/common/decorator';

@ApiTags('Features')
@UseGuards(JwtAuthGuard)
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  create(@Body() dto: CreateFeatureDto, @GetUser('id') userid: string) {
    return this.featureService.create(dto, userid);
  }

  @Get()
  findAll(@Query('projectId') projectId: string) {
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
  remove(@Param('id') id: string, @GetUser('id') userid: string) {
    return this.featureService.remove(id, userid);
  }
}
