import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(_is => Number)
  id: number

  @Field(_is => String)
  @Column()
  name: string;

  @Field(_is => Boolean)
  @Column()
  isVegan: boolean;

  @Field(_is => String)
  @Column()
  address: string;

  @Field(_is => String)
  @Column()
  ownersName: string;
}
