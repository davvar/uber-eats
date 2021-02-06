import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(_is => Number)
  id: number;

  @Field(_is => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(_is => Boolean, { defaultValue: true})
  @Column({ default: true })
  @IsBoolean()
  @IsOptional()
  isVegan: boolean;

  @Field(_is => String)
  @Column()
  address: string;
}
