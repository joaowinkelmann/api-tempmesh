import { Module } from '@nestjs/common';
import { ControllersService } from './controllers.service';
import { ControllersController } from './controllers.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ControllersController],
  providers: [ControllersService, PrismaService],
})
export class ControllersModule {}
