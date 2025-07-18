import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './project-create.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsBoolean()
  @IsOptional()
  updateInviteCode?: boolean;
}
