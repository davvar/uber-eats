import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard, AuthUser } from 'src/auth';
import { CoreOutput } from 'src/common';
import {
  CreateAccountInput,
  EditProfileInput,
  EditProfileOutput,
  LogInInput,
  LogInOutput,
  UserProfileInput,
  UserProfileOutput
} from './dtos';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(_of => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(_returns => CoreOutput)
  async createAccount(
    @Args('input') input: CreateAccountInput,
  ): Promise<CoreOutput> {
    try {
      return this.userService.createAccount(input);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Mutation(_returns => LogInOutput)
  async logIn(@Args('input') input: LogInInput): Promise<LogInOutput> {
    try {
      return this.userService.logIn(input);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Query(_returns => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard)
  @Query(_returns => UserProfileOutput)
  async userProfile(
    @Args() { userId }: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.userService.findById(userId);

      if (!user) {
        throw new Error();
      }

      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: 'user not found' };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(_returns => EditProfileOutput)
  async editProfile(
    @AuthUser() { id }: User,
    @Args('input') updates: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.userService.editProfile(id, updates);

      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
