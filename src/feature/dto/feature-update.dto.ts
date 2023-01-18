import { PartialType } from '@nestjs/mapped-types';
import { CreateFeatureDto } from './feature-create.dto';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
