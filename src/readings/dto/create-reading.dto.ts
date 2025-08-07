import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsMACAddress,
  IsNumber,
  IsRFC3339,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReadingDataPointDto {
  @IsMACAddress()
  mac: string;

  @IsNumber()
  temp: number;

  @IsNumber()
  hum: number;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lon: number;

  // Timestamp da leitura
  @IsRFC3339()
  readingTime: string;
}

export class CreateReadingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReadingDataPointDto)
  data: ReadingDataPointDto[];
}
