import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { user } = GqlExecutionContext.create(ctx).getContext();
    return user;
  },
);
