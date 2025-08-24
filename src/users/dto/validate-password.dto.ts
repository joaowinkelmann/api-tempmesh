import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidatePasswordDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}
