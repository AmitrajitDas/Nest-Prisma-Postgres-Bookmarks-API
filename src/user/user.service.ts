import { Injectable } from '@nestjs/common';
import { EditUserDto } from './dto/edit-user.dto';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
    delete user.passwordHash;
    return user;
  }
}
