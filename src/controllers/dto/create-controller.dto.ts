import { DeviceStatus } from '@prisma/client';

export class CreateControllerDto {
  macAddress: string;
  name: string;
  x: number;
  y: number;
  description?: string;
  zoneId?: string;
  status?: DeviceStatus;
}
