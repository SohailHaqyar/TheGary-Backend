import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Post('/github/oauth/:code')
  exchangeToken(@Param('code') code: string) {
    return this.userService.authenticateGithub(code);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getUser(@GetUser() user: User) {
    return this.userService.getMe(user.id);
  }
}
