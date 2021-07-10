import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { JWT_SECRET } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // async validate(email: string, password: string) {
  //   const user = await this.usersService.getUserByEmail(email);
  //   if (!user) return null;
  //   const isValid = await compare(password, user.password);
  //   return isValid ? user : null;
  // }

  login(user: User): { access_token: string } {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyToken(token: string): Promise<User> {
    const decoded = this.jwtService.verify(token, { secret: JWT_SECRET });
    const user = this.usersService.getUserByEmail(decoded.email);
    if (!user)
      throw new NotFoundException(`Unable to get the user from decoded token`);
    return user;
  }
}
