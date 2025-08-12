import { Module } from '@nestjs/common';
import { MeshesService } from './meshes.service';
import { MeshesController } from './meshes.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ZonesService } from '../zones/zones.service';

@Module({
  controllers: [MeshesController],
  providers: [MeshesService, PrismaService, ZonesService],
})
export class MeshesModule {}
