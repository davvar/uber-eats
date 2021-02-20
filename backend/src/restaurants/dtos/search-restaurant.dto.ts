import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInput } from 'src/common';
import { RestaurantsOutput } from './restaurants.dto';

@InputType()
export class SearchRestaurantInput extends PaginationInput{
  @Field(type => String)
  query: string
}

@ObjectType()
export class SearchRestaurantOutput extends RestaurantsOutput {}