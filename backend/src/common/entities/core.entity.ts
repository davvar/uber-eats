import { Field, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@ObjectType()
export class CoreEntity {
  @Field(_is => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(_is => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(_is => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
