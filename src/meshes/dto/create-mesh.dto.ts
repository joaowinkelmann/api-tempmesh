import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeshDto {
  @ApiProperty({ example: 'My Mesh', description: 'Name of the mesh' })
  @IsString()
  name: string;

  @ApiProperty({ example: -23.55052, description: 'Latitude of the mesh center' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -46.633308, description: 'Longitude of the mesh center' })
  @IsNumber()
  lon: number;
}
