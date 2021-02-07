import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreOutput {
  @Field(_is => String, { nullable: true })
  error?: string;

  @Field(_is => Boolean)
  ok: boolean;
}
