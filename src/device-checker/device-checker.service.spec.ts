import { Test, TestingModule } from '@nestjs/testing';
import { DeviceCheckerService } from './device-checker.service';

describe('DeviceCheckerService', () => {
  let service: DeviceCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceCheckerService],
    }).compile();

    service = module.get<DeviceCheckerService>(DeviceCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
