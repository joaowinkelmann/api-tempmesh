import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import type { Express } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { TilerService } from '../tiler/tiler.service';
import { UploaderService } from '../uploader/uploader.service';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class MeshesService {
  private readonly logger = new Logger(MeshesService.name);
  constructor(
    private prisma: PrismaService,
    private tiler: TilerService,
    private uploader: UploaderService,
  ) {}

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
    const mesh = await this.findOne(id, userId);
    if (!mesh) return null;
    return await this.prisma.mesh.update({
      where: { id },
      data: updateMeshDto,
    });
  }

  async remove(id: string, userId: string) {
    const mesh = await this.findOne(id, userId);
    if (!mesh) return null;
    return await this.prisma.mesh.delete({
      where: { id },
    });
  }

  // Generates tiles and uploads them to OCI. Returns the Leaflet tile URL template.
  async uploadMap(file: Express.Multer.File, userId: string, meshId: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!meshId) {
      throw new BadRequestException('No meshId was provided');
    }

    // Support both memory and disk storage
    const buffer =
      file.buffer ?? (file.path ? await fs.readFile(file.path) : undefined);

    if (!buffer) {
      throw new BadRequestException('Invalid upload: empty file buffer');
    } else {
      this.logger.debug(`Uploaded file size: ${buffer.length} bytes`);
    }

    const { tmpDir, maxZoom, prefix, ext } =
      await this.tiler.makeTilesFromImageBuffer(buffer, meshId);

    try {
      await this.uploader.uploadDirectory(prefix, tmpDir);
    } finally {
      // cleanup temp dir and uploaded file (when using disk storage)
      await fs
        .rm(tmpDir, { recursive: true, force: true })
        .catch(() => undefined);
      if (file.path) {
        const dir = path.dirname(file.path);
        await fs.rm(file.path, { force: true }).catch(() => undefined);
        await fs
          .rm(dir, { recursive: true, force: true })
          .catch(() => undefined);
      }
    }

    const base = this.uploader.getBaseUrl();
    const mapUrl = `${base}/${prefix}/{z}/{x}/{y}.${ext}`;

    this.logger.log(`Mounted map URL: ${mapUrl}`);

    // If a meshId is passed, persist the mapUrl to that mesh (only if it belongs to the user)
    if (meshId && userId) {
      const mesh = await this.findOne(meshId, userId);
      if (mesh) {
        // let updated_mesh = await this.prisma.mesh.update({
        await this.prisma.mesh.update({
          where: { id: meshId },
          data: { mapUrl },
        });
        // this.logger.debug(`Updated mesh: ${JSON.stringify(updated_mesh)}`);
      } else {
        this.logger.warn(
          `Mesh ${meshId} not found for user ${userId}; not updating mapUrl`,
        );
      }
    }

    return {
      mapUrl,
      maxZoom,
      minZoom: 0,
      prefix,
      ext,
    };
  }
}
