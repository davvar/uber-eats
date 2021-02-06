import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from '.';

@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}

@ArgsType()
export class UpdateRestaurantDto {
  @Field(_is => Number)
  id: number;

  @Field(_is => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
