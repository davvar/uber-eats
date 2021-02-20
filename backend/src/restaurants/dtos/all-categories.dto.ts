import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field(is => [Category], { nullable: true})
  categories?: Category[];
}