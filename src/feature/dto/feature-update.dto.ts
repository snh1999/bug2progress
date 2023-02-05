import { PartialType } from '@nestjs/mapped-types';
import { CreateFeatureDto } from './';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
