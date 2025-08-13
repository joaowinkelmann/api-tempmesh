import { IsString, IsOptional, IsNumber, IsEnum, IsMACAddress } from 'class-validator';
import { DeviceStatus, DeviceRole } from '@prisma/client';

export class CreateDeviceDto {
  @IsMACAddress()
  macAddress: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsEnum(DeviceRole)
  role?: DeviceRole;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  deviceColor?: string;

  @IsString()
  @IsOptional()
  meshId: string;
}