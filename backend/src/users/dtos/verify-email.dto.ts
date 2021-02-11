import { InputType, PickType } from '@nestjs/graphql';
import { Verification } from '..';


@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}
