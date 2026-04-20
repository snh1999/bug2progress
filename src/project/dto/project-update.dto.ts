import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateProjectDto } from './project-create.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsBoolean()
  @IsOptional()
  updateInviteCode?: boolean;
}
