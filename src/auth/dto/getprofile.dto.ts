import { IsDefined } from 'class-validator';

export class GetProfileDto {
  @IsDefined()
  user: {
    id: string;
    email: string;
    name: string;
  };
}
