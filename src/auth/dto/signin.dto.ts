import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidatePasswordDto } from 'src/users/dto/validate-password.dto';

export class SignInDto {
  @ApiProperty({ example: 'test@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  password: string;
}

export class SignInResponseDto {
  user: ValidatePasswordDto;

  @IsString()
  @IsNotEmpty()
  access_token: string;
}
