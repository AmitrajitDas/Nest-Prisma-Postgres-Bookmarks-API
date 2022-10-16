import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signup() {
    return { msg: 'Signed Up' };
  }

  login() {
    return { msg: 'Logged In' };
  }
}
