import { Module } from '@nestjs/common';
import { MeshesService } from './meshes.service';
import { MeshesController } from './meshes.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MeshesController],
  providers: [MeshesService, PrismaService],
})
export class MeshesModule {}
