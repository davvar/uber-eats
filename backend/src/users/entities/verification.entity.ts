import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(_returns => String)
  code: string;

  @OneToOne(_returns => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  creatCode(): void {
    this.code = uuid();
  }
}
