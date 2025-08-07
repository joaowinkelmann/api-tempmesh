import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReadingDataPointDto } from './dto/create-reading.dto';

@Injectable()
export class ReadingsService {
  private readonly logger = new Logger(ReadingsService.name);

  constructor(private prisma: PrismaService) {}

  async createSensorReadings(readings: ReadingDataPointDto[]) {
    // 1. Pega os MAC únicos do json recebido
    const macAddresses = [...new Set(readings.map((r) => r.mac))];
    this.logger.log(`Recebido dados dos seguintes MACs: ${macAddresses.join(', ')}`);

    // 2. Encontra os workers com esses endereços no banco
    const workers = await this.prisma.worker.findMany({
      where: {
        macAddress: {
          in: macAddresses,
        },
      },
      select: {
        id: true,
        macAddress: true,
      },
    });

    // 3. Faz um mapa do mac para o worker
    const workerIdMap = new Map(workers.map((w) => [w.macAddress, w.id]));
    this.logger.log(`Encontrados ${workerIdMap.size} trabalhadores registrados no banco de dados.`);

    // 4. Monta os dados pra inserir no banco
    const readingsToCreate = readings
      .map((reading) => {
        const workerId = workerIdMap.get(reading.mac);
        if (!workerId) {
          // Se não está registrado ainda, ignora
          this.logger.warn(
            `Ignorando dados de MAC não registrado: ${reading.mac}`,
          );
          return null;
        }
        return {
          temperature: reading.temp,
          humidity: reading.hum,
          readingTime: new Date(),
          workerId: workerId
        };
      })
      .filter((r) => r !== null);

    if (readingsToCreate.length === 0) {
      this.logger.log('Nenhum dado válido para inserir. Todos os MACs não registrados.');
      return { createdCount: 0, unregisteredCount: readings.length };
    }

    // 5. Inserindo em massa
    const result = await this.prisma.sensorReading.createMany({
      data: readingsToCreate,
    });

    this.logger.log(`Foram criados ${result.count} registros de leitura.`);

    return {
      createdCount: result.count,
      unregisteredCount: readings.length - result.count,
    };
  }
}