import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteRestaurantInput {
  @Field(_is => Number)
  id: number;
}
