import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GetUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth';
import { User } from './entities/user.entity';
import { RegisterUserInput } from './dto/register.dto';
import { UsersService } from './users.service';
import { Following } from './entities/follow.entity';

@ObjectType()
class LoginResponse {
  @Field()
  access_token: string;
}
@ObjectType()
class MeResponse {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;
}

@ObjectType()
export class FollowRes {
  @Field(() => Following, { nullable: true })
  followResults: Following | null;
  @Field({ nullable: true })
  unFollowResults: string | null;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  users() {
    return this.usersService.getUsers();
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  user(@Args({ name: 'userId', type: () => String }) userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@GetUser() user: User) {
    return this.usersService.getMe(user.id);
  }

  @Mutation(() => User)
  register(@Args('registerUserInput') registerUserInput: RegisterUserInput) {
    return this.usersService.create(registerUserInput);
  }

  @Mutation(() => LoginResponse)
  continueWithGoogle(
    @Args({ name: 'googleIdToken', type: () => String }) googleIdToken: string,
  ) {
    return this.usersService.continueWithGoogle(googleIdToken);
  }

  @Mutation(() => FollowRes)
  @UseGuards(GqlAuthGuard)
  followUser(
    @GetUser() user: User,
    @Args({ name: 'id', type: () => String }) id: string,
  ) {
    return this.usersService.toggleFollow(id, user.id);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  getFollowers(@GetUser() user: User) {
    return this.usersService.getUserFollowers(user.id);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  getFollowing(@GetUser() user: User): Promise<User[]> {
    return this.usersService.getUserFollowing(user.id);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  getUserFollowers(@Args({ name: 'id', type: () => String }) id: string) {
    return this.usersService.getUserFollowers(id);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  getUserFollowings(@Args({ name: 'id', type: () => String }) id: string) {
    return this.usersService.getUserFollowing(id);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  WhoToFollow(@GetUser() user: User) {
    return this.usersService.whoToFollow(user.id);
  }
}
