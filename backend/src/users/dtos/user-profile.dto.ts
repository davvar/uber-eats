import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common';
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field(is => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(is => User, { nullable: true })
  user?: User;
}
