import { Test, TestingModule } from '@nestjs/testing';
import { MeshesService } from './meshes.service';

describe('MeshesService', () => {
  let service: MeshesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeshesService],
    }).compile();

    service = module.get<MeshesService>(MeshesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
