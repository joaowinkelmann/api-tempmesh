import { ApiProperty } from '@nestjs/swagger';
import { IsMACAddress, IsNumber, IsRFC3339 } from 'class-validator';

export class Reading {
  @ApiProperty({
    description: 'Endereço MAC do dispositivo que realizou a leitura.',
    example: 'AA:BB:CC:DD:EE:01',
  })
  @IsMACAddress()
  mac: string;

  @ApiProperty({
    description: 'Temperatura aferida em graus Celsius.',
    example: 25.5,
  })
  @IsNumber()
  temp: number;

  @ApiProperty({
    description: 'Umidade relativa do ar em porcentagem.',
    example: 60.2,
  })
  @IsNumber()
  hum: number;

  @ApiProperty({
    description: 'Timestamp da leitura no formato RFC3339.',
    example: '2024-08-22T10:00:00Z',
  })
  @IsRFC3339()
  readingTime: string;
}
