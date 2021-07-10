import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserInput } from './dto/register.dto';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from 'src/auth/constants';
import { JwtService } from '@nestjs/jwt';
import { Following } from './entities/follow.entity';
import { FollowRes } from './users.resolver';
import { map } from 'rxjs/operators';
import { GithubLoader } from 'graphql-tools';

const client_id = '26cc14764a4d1f570bda';
const client_secret = '3e57125327c3616e3444a94ee9e7f31c41164943';

export interface GithubUser {
  avatar_url: string;
  bio: string;
  blog: string;
  company: string;
  created_at: string;
  email: string;
  id: number;
  location: string;
  name: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private httpService: HttpService,
    private jwtService: JwtService,

    @InjectRepository(Following)
    private followerRepository: Repository<Following>,
  ) {}

  async verifyGoogleToken(token: string) {
    try {
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });

      return ticket.getPayload();
    } catch (error) {
      throw new BadRequestException({
        error,
        message: 'Invalide ID Token',
      });
    }
  }

  async create(registerUserInput: RegisterUserInput) {
    registerUserInput.password = await hash(registerUserInput.password, 10);
    const user = await this.usersRepository.save(
      this.usersRepository.create({ ...registerUserInput }),
    );
    return user;
  }
  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['posts'],
    });
  }

  async getUsers() {
    return await this.usersRepository.find();
  }

  async getMe(id: string) {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['followers', 'following'],
    });
  }

  async continueWithGoogle(googleIdToken: string) {
    const result = await this.verifyGoogleToken(googleIdToken);
    /**
     * Check If the user already exists
     */
    const user = await this.getUserByEmail(result.email);
    if (!user) {
      const createdUser = await this.usersRepository.save(
        this.usersRepository.create({
          email: result.email,
          username: result.name.trim().toLowerCase(),
          imageUrl: result.picture,
        }),
      );

      const payload = { sub: createdUser.id, email: createdUser.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      const payload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }

  async getUserById(id: string) {
    return await this.usersRepository.findOne({ id }, { relations: ['posts'] });
  }

  async handleAlreadyFollwing(id: string): Promise<FollowRes> {
    try {
      await this.followerRepository.delete(id);
      return { followResults: null, unFollowResults: 'success' };
    } catch (e) {
      return { followResults: null, unFollowResults: 'fail' };
    }
  }

  async followUser(id: string, userId: string): Promise<FollowRes> {
    const result = await this.followerRepository.save(
      this.followerRepository.create({
        follower: { id: userId },
        following: { id },
      }),
    );
    return { followResults: result as any, unFollowResults: null };
  }
  async toggleFollow(id: string, userId: string): Promise<FollowRes> {
    const following = await this.followerRepository.findOne({
      follower: { id: userId },
      following: { id },
    });
    return following
      ? this.handleAlreadyFollwing(following.id)
      : this.followUser(id, userId);
  }

  async getUserFollowers(id: string) {
    const result = await this.followerRepository.find({
      where: { following: { id } },
    });
    const followers = [];
    for (const f of result) {
      followers.push(f.follower);
    }
    return followers;
  }

  async getUserFollowing(id: string) {
    const result = await this.followerRepository.find({
      where: {
        follower: { id },
      },
    });
    const followings = [];
    for (const f of result) {
      followings.push(f.following);
    }
    return followings;
  }

  async whoToFollow(id: string) {
    // Get all the users.
    const users = await this.getUsers();
    // Get all my followers
    const followings = await this.getUserFollowing(id);

    let peopleToFollow = users.filter(function (array_el) {
      return (
        followings.filter(function (other_el) {
          return other_el.id == array_el.id;
        }).length == 0
      );
    });

    return peopleToFollow;
  }

  async getGithubData(token: string) {
    const result = await this.httpService
      .get(`https://api.github.com/user`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
      .pipe(map((response) => response.data))
      .toPromise();

    return result;
  }

  async authenticateGithub(code: string) {
    const result = await this.httpService
      .post(
        `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&${code}`,
      )
      .pipe(map((response) => response.data))
      .toPromise();

    let access_token = result.split('&')[0].split('=')[1];
    const userData = await this.getGithubData(access_token);
    return await this.continueWithGithub(userData);
  }

  async continueWithGithub(githubUser: GithubUser) {
    // Check if user exists
    const user = await this.getUserByEmail(githubUser.email);
    if (!user) {
      const createdUser = await this.usersRepository.save(
        this.usersRepository.create({
          email: githubUser.email,
          username: githubUser.name.trim().toLowerCase(),
          imageUrl: githubUser.avatar_url,
        }),
      );
      const payload = { sub: createdUser.id, email: createdUser.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      const payload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }
}
