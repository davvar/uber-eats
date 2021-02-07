import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationOutput {
  @Field(_is => String, { nullable: true })
  error?: string;

  @Field(_is => Boolean)
  ok: boolean;
}
