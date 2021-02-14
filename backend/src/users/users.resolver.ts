import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { CoreOutput } from 'src/common';
import {
  CreateAccountInput,
  EditProfileInput,
  EditProfileOutput,
  LogInInput,
  LogInOutput,
  UserProfileInput,
  UserProfileOutput,
  VerifyEmailInput
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
    return this.userService.createAccount(input);
  }

  @Mutation(_returns => LogInOutput)
  logIn(@Args('input') input: LogInInput): Promise<LogInOutput> {
    return this.userService.logIn(input);
  }

  @Query(_returns => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard)
  @Query(_returns => UserProfileOutput)
  userProfile(
    @Args() { userId }: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.userService.findById(userId);
  }

  @UseGuards(AuthGuard)
  @Mutation(_returns => EditProfileOutput)
  editProfile(
    @AuthUser() { id }: User,
    @Args('input') updates: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.userService.editProfile(id, updates);
  }

  @Mutation(_returns => CoreOutput)
  verifyEmail(@Args('input') { code }: VerifyEmailInput): Promise<CoreOutput> {
    return this.userService.verifyEmail(code);
  }
}
