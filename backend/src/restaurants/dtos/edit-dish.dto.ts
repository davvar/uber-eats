import { Field, InputType, Int, ObjectType, OmitType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common';
import { Dish } from '../entities/dish.entity';
import { CreateDishInput } from './create.dto';

@InputType()
export class EditDishInput extends OmitType(CreateDishInput, ['restaurantId']) {
  @Field(type => Int)
  dishId: number
}

@ObjectType()
export class EditDishOutput extends CoreOutput {
  @Field(type => Dish, { nullable: true })
  dish?: Dish;
}
