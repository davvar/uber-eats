import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(_is => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field(_is => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field(_is => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.category)
  restaurants: Restaurant[];

  @Field(_is => String)
  @Column({ unique: true })
  @IsString()
  slug: string;
}
