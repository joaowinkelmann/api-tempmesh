import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  private users: Array<{ userId: number; username: string; password: string }>;

  constructor(private prismaService: PrismaService) {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        userId: 2,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async findOne(username: string) {
    return await this.users.find((user) => user.username === username);
  }
}
