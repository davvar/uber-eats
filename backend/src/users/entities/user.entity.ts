import { InternalServerErrorException } from '@nestjs/common';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql';
import * as bycrypt from 'bcryptjs';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { CoreEntity } from 'src/common';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

export enum UserRole {
  CLIENT = 'CLIENT',
  OWNER = 'OWNER',
  DELIVERY = 'DELIVERY',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(_is => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(_is => String)
  @IsString()
  password: string;

  @Column({ default: false })
  @Field(_is => Boolean)
  @IsBoolean()
  verified: boolean;

  @Column({ type: 'enum', enum: UserRole })
  @Field(_is => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Field(_is => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.owner)
  restaurants: Restaurant[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) {
      return;
    }

    try {
      this.password = await bycrypt.hash(this.password, 10);
    } catch (error) {
      console.log({ error });
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      return await bycrypt.compare(password, this.password);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
