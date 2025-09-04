import { Module } from '@nestjs/common';
import { MeshesService } from './meshes.service';
import { MeshesController } from './meshes.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ZonesService } from '../zones/zones.service';
import { DevicesService } from '../devices/devices.service';
@Module({
  controllers: [MeshesController],
  providers: [MeshesService, PrismaService, ZonesService, DevicesService],
})
export class MeshesModule {}
