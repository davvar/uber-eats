import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { MutationOutput } from 'src/common';
import { CreateAccountInput, LogInInput, LogInOutput } from './dtos';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(_of => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(_returns => MutationOutput)
  async createAccount(
    @Args('input') input: CreateAccountInput,
  ): Promise<MutationOutput> {
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

  @Query(_return => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() user: User) {
    return user;
  }
}
