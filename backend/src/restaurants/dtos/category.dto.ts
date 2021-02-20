import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInput, PaginationOutput } from 'src/common';
import { Category } from '../entities/category.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(is => String)
  slug: string
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(is => Category, { nullable: true })
  category?: Category;
}