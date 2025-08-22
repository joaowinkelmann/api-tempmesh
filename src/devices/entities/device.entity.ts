import { ApiProperty } from '@nestjs/swagger';
import { DeviceRole } from '@prisma/client';
import { DeviceStatus } from '@prisma/client';

export class Device {
  @ApiProperty({
    example: '24:58:7C:CC:E5:B4',
    description: 'Endereço MAC do dispositivo',
  })
  macAddress: string;

  @ApiProperty({
    example: 'Luzes de Natal',
    description: 'Nome a ser dado ao dispositivo',
  })
  name: string;

  @ApiProperty({
    example: 'Controlador principal com acesso à rede AP',
    description: 'Descrição do dispositivo',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    example: 5,
    description: 'Posição X do dispositivo na malha',
    required: false,
  })
  x: number;

  @ApiProperty({
    example: 5,
    description: 'Posição Y do dispositivo na malha',
    required: false,
  })
  y: number;

  @ApiProperty({
    example: DeviceStatus.ACTIVE,
    description:
      'Status do dispositivo, pode ser ACTIVE, PENDING ou INACTIVE. ACTIVE significa que o dispositivo está ativo e funcionando, PENDING significa que o dispositivo foi descoberto mas ainda não foi configurado, e INACTIVE significa que o dispositivo está inativo.',
  })
  status?: DeviceStatus;

  @ApiProperty({
    example: DeviceRole.CONTROLLER,
    description:
      'Função do dispositivo na rede, pode ser CONTROLLER ou WORKER. CONTROLLER é o gateway que tem conexão direta com a rede Ethernet, enquanto WORKER são dispositivos que executam tarefas de maneira periódica.',
  })
  role?: DeviceRole;

  @ApiProperty({
    example: 'zone-id-123',
    description: 'ID da zona a que o dispositivo pertence',
    required: false,
  })
  zoneId?: string | null;

  @ApiProperty({
    example: '#FF0000',
    description: 'Cor do dispositivo, usada para visualização no mapa',
    required: false,
  })
  deviceColor?: string | null;

  @ApiProperty({
    example: 'mesh-id-123',
    description:
      'ID da malha a que o dispositivo pertence. Pode ser definida de maneira opcional durante o cadastro do dispositivo.',
    required: false,
  })
  meshId?: string | null;

  @ApiProperty({
    example: 2,
    description: 'Número de leituras que o dispositivo deve enviar por lote.',
    required: false,
  })
  readingsPerBatch: number | null;

  @ApiProperty({
    example: 3600,
    description:
      'Intervalo de tempo em segundos entre os "wake ups" do dispositivo.',
    required: false,
  })
  wakeUpInterval: number | null;
}
