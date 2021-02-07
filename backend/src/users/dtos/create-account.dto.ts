import { InputType, PickType } from '@nestjs/graphql';
import { User } from '..';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}
