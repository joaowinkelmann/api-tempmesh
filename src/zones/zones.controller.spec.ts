import { Test, TestingModule } from '@nestjs/testing';
import { ZonesController } from './zones.controller';
import { ZonesService } from './zones.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ZonesController', () => {
  let controller: ZonesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonesController],
      providers: [ZonesService, { provide: PrismaService, useValue: {} }],
    }).compile();

    controller = module.get<ZonesController>(ZonesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
