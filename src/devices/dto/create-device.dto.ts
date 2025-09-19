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
  @ApiProperty({ example: '00:0A:E6:3E:FD:E1', description: 'MAC address of the device' })
  @IsMACAddress()
  macAddress: string;

  @ApiProperty({ example: 'My Device', description: 'Name of the device' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A device in the living room', description: 'Description of the device', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10.5, description: 'X coordinate of the device on the map' })
  @IsNumber()
  x: number;

  @ApiProperty({ example: 20.5, description: 'Y coordinate of the device on the map' })
  @IsNumber()
  y: number;

  @ApiProperty({ enum: DeviceStatus, example: DeviceStatus.ACTIVE, description: 'Status of the device', required: false })
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @ApiProperty({ enum: DeviceRole, example: DeviceRole.WORKER, description: 'Role of the device', required: false })
  @IsOptional()
  @IsEnum(DeviceRole)
  role?: DeviceRole;

  @ApiProperty({ example: 'zone-id-123', description: 'ID of the zone the device belongs to', required: false })
  @IsOptional()
  @IsString()
  zoneId?: string;

  @ApiProperty({ example: '#FFFFFF', description: 'Color of the device on the map', required: false })
  @IsOptional()
  @IsString()
  deviceColor?: string;

  @ApiProperty({ example: 'mesh-id-123', description: 'ID of the mesh the device belongs to' })
  @IsString()
  meshId: string;

  @ApiProperty({ example: 10, description: 'Number of readings per batch', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readingsPerBatch?: number;

  @ApiProperty({ example: 3600, description: 'Wake up interval in seconds', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  wakeUpInterval?: number;
}
