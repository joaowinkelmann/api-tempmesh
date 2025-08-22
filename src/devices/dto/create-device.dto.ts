import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsMACAddress,
  IsInt,
  Min,
} from 'class-validator';
import { DeviceStatus, DeviceRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty()
  @IsMACAddress()
  macAddress: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @ApiProperty()
  @IsOptional()
  @IsEnum(DeviceRole)
  role?: DeviceRole;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zoneId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  deviceColor?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  meshId: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(1)
  readingsPerBatch?: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(1)
  wakeUpInterval?: number;
}
