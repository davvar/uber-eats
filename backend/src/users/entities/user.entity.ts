import { InternalServerErrorException } from '@nestjs/common';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql';
import * as bycrypt from 'bcryptjs';
import { IsEmail, IsEnum } from 'class-validator';
import { CoreEntity } from 'src/common';
import { BeforeInsert, Column, Entity } from 'typeorm';

enum UserRole {
  CLIENT,
  OWNER,
  DELIVERY,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(_is => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(_is => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(_is => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
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
