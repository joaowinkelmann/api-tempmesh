import { IsString, IsNumber } from 'class-validator';

export class CreateMeshDto {
  @IsString()
  name: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}
