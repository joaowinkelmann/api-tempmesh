import { PartialType } from '@nestjs/mapped-types';
import { CreateReadingsDto } from './create-readings.dto';

export class UpdateReadingsDto extends PartialType(CreateReadingsDto) {}
