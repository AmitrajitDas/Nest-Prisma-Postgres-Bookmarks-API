import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from './../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
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

      return this.signToken(user.id, user.email);
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

      return this.signToken(user.id, user.email);
    } catch (error) {
      throw new error();
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return { access_token: token };
  }
}
