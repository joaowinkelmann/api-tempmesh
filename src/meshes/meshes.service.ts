import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';

@Injectable()
export class MeshesService {
  constructor(private prisma: PrismaService) {}

  async create(createMeshDto: CreateMeshDto, userId: string) {
    return await this.prisma.mesh.create({
      data: {
        ...createMeshDto,
        userId,
        name: createMeshDto.name, // Ensure name is provided
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.mesh.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    return await this.prisma.mesh.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, updateMeshDto: UpdateMeshDto, userId: string) {
    // Only update if mesh belongs to user
    const mesh = await this.findOne(id, userId);
    if (!mesh) return null;
    return await this.prisma.mesh.update({
      where: { id },
      data: updateMeshDto,
    });
  }

  async remove(id: string, userId: string) {
    // Only delete if mesh belongs to user
    const mesh = await this.findOne(id, userId);
    if (!mesh) return null;
    return await this.prisma.mesh.delete({
      where: { id },
    });
  }
}
