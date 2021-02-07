import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MutationOutput } from 'src/common';
import { User } from '.';
import { CreateAccountInput, LogInInput, LogInOutput } from './dtos';
import { UsersService } from './users.service';

@Resolver(_of => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(_returns => Boolean)
  hi() {
    return true;
  }

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
}
