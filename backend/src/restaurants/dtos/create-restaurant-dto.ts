import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {

  @Field(_is => String)
  categoryName: string
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(type => Int)
  restaurantId?: number;
}