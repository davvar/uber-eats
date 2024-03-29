import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionType', { isAbstract: true })
@ObjectType()
export class OrderItemOption extends CoreEntity {
  @Field(type => String)
  name: string;

  @Field(type => String, { nullable: true })
  choice?: string
}

@InputType('OrderItemType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @ManyToOne(type => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(type => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
