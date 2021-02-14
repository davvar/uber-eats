import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
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

  @Role('ANY')
  @Query(_returns => User)
  me(@AuthUser() user: User) {
    return user;
  }

  @Role('ANY')
  @Query(_returns => UserProfileOutput)
  userProfile(
    @Args() { userId }: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.userService.findById(userId);
  }

  @Role('ANY')
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
