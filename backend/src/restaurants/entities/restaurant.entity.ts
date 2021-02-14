import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(_is => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(_is => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(_is => String)
  @Column()
  @IsString()
  address: string;

  @Field(_is => Category, { nullable: true })
  @ManyToOne(type => Category, category => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(_is => User)
  @ManyToOne(type => User, user => user.restaurants)
  owner: User;
}
