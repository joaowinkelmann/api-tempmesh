import { Test, TestingModule } from '@nestjs/testing';
import { MeshesController } from './meshes.controller';
import { MeshesService } from './meshes.service';
import { ZonesService } from '../zones/zones.service';
import { DevicesService } from '../devices/devices.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MeshesController', () => {
  let controller: MeshesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeshesController],
      providers: [
        MeshesService,
        { provide: ZonesService, useValue: {} },
        { provide: DevicesService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<MeshesController>(MeshesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
