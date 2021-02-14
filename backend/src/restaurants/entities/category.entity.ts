import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(_is => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(_is => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(_is => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.category)
  restaurants: Restaurant[];
}
