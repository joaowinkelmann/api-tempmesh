import { Test, TestingModule } from '@nestjs/testing';
import { MeshesController } from './meshes.controller';
import { MeshesService } from './meshes.service';

describe('MeshesController', () => {
  let controller: MeshesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeshesController],
      providers: [MeshesService],
    }).compile();

    controller = module.get<MeshesController>(MeshesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
