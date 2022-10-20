import { AuthDto } from './dto/auth.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { domainToASCII } from 'url';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    const { email, password } = dto;
    const passwordHash = await argon.hash(password); // gen password hash
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      delete user.passwordHash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credentials Taken');
      }
      throw error;
    }
  }

  async login(dto: AuthDto) {
    const { email, password } = dto;
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw new ForbiddenException('Credentials Incorrect');
      const match = argon.verify(user.passwordHash, password);
      if (!match) throw new ForbiddenException('Credentials Incorrect');

      delete user.passwordHash;
      return user;
    } catch (error) {
      throw new error();
    }
  }
}
