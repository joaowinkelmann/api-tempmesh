import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';
import { DeviceStatus } from '@prisma/client';

@Injectable()
export class ControllersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createControllerDto: CreateControllerDto,
    meshId: string,
    userId: string,
  ) {
    // Validate mesh ownership
    const mesh = await this.prisma.mesh.findFirst({
      where: { id: meshId, userId },
    });
    if (!mesh)
      throw new ForbiddenException('Mesh not found or not owned by user');

    // Optionally, validate that zone belongs to mesh if zoneId is provided
    if (createControllerDto.zoneId) {
      const zone = await this.prisma.zone.findFirst({
        where: { id: createControllerDto.zoneId, meshId },
      });
      if (!zone)
        throw new ForbiddenException(
          'Zone not found or does not belong to mesh',
        );
    }

    // Create controller with all required fields
    return this.prisma.controller.create({
      data: {
        macAddress: createControllerDto.macAddress,
        name: createControllerDto.name,
        x: createControllerDto.x,
        y: createControllerDto.y,
        description: createControllerDto.description,
        zoneId: createControllerDto.zoneId,
        status: createControllerDto.status ?? DeviceStatus.PENDING,
      },
    });
  }

  async findAll(meshId: string, userId: string) {
    // Validate mesh ownership
    const mesh = await this.prisma.mesh.findFirst({
      where: { id: meshId, userId },
    });
    if (!mesh)
      throw new ForbiddenException('Mesh not found or not owned by user');

    // Find all controllers in zones belonging to this mesh
    return this.prisma.controller.findMany({
      where: {
        zone: { meshId },
      },
    });
  }

  async findOne(id: string, meshId: string, userId: string) {
    // Validate mesh ownership
    const mesh = await this.prisma.mesh.findFirst({
      where: { id: meshId, userId },
    });
    if (!mesh)
      throw new ForbiddenException('Mesh not found or not owned by user');

    return this.prisma.controller.findFirst({
      where: {
        id,
        zone: { meshId },
      },
    });
  }

  async update(
    id: string,
    updateControllerDto: UpdateControllerDto,
    meshId: string,
    userId: string,
  ) {
    const controller = await this.findOne(id, meshId, userId);
    if (!controller)
      throw new ForbiddenException('Controller not found or not accessible');

    return this.prisma.controller.update({
      where: { id },
      data: {
        ...updateControllerDto,
        ...updateControllerDto,
        ...(updateControllerDto.zoneId !== undefined && {
          zoneId: updateControllerDto.zoneId,
        }),
        ...(updateControllerDto.zoneId !== undefined && {
          zoneId: updateControllerDto.zoneId,
        }),
      },
    });
  }

  async remove(id: string, meshId: string, userId: string) {
    const controller = await this.findOne(id, meshId, userId);
    if (!controller)
      throw new ForbiddenException('Controller not found or not accessible');

    return this.prisma.controller.delete({
      where: { id },
    });
  }
}
