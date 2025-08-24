import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Reading } from '../entities/reading.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReadingsDto {
  @ApiProperty({
    description: 'Um array de leituras de sensores.',
    type: [Reading],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Reading)
  data: Reading[];
}
