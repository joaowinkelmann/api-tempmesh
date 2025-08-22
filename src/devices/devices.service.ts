import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto, userId: string) {
    return await this.prisma.device.create({
      data: {
        ...createDeviceDto,
        userId,
      },
    });
  }

  async findAll() {
    return await this.prisma.device.findMany();
  }

  async findOne(id: string): Promise<Device | undefined | null> {
    return await this.prisma.device.findUnique({
      where: { id },
    });
  }

  async findDevicesByZone(
    zoneId: string,
    userId: string,
  ): Promise<Device[] | undefined | null> {
    return await this.prisma.device.findMany({
      where: {
        zoneId,
        zone: { mesh: { userId } }, // A zone tem que pertencer ao usuário
      },
    });
  }

  async findDevicesByUser(userId: string): Promise<Device[] | undefined | null> {
    return await this.prisma.device.findMany({
      where: { userId },
    });
  }

  async findByMacAndUser(
    macAddress: string,
    userId: string,
  ): Promise<Device | undefined | null> {
    const device = await this.prisma.device.findFirst({
      where: { macAddress, userId },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto, userId: string) {
    // Only allow update if device belongs to user
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    if (device.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this device',
      );
    }
    return await this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
    });
  }

  async remove(id: string, userId: string) {
    // Only allow delete if device belongs to user
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device || device.userId !== userId) {
      throw new Error('Device not found or access denied');
    }
    return this.prisma.device.delete({
      where: { id },
    });
  }
}
