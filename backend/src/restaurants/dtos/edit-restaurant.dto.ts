import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantInput } from '.';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(_is => Number)
  id: number;
}
