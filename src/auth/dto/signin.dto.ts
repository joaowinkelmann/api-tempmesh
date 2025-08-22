import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'test@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123', description: 'User password' })
  @IsNotEmpty()
  password: string;
}
