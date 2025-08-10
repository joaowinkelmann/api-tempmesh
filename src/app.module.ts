import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReadingsModule } from './readings/readings.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { MeshesModule } from './meshes/meshes.module';
import { ZonesModule } from './zones/zones.module';
import { ControllersModule } from './controllers/controllers.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ReadingsModule,
    AuthModule,
    UsersModule,
    HealthModule,
    MeshesModule,
    ZonesModule,
    ControllersModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
