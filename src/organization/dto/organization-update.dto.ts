import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './organization-create.dto';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
