import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Gender } from '../enums/gender.enum';

@Entity('profiles')
@ObjectType()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  userId: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  address?: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  @Field(() => Float, { nullable: true })
  lat?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  @Field(() => Float, { nullable: true })
  lng?: number;

  @Column({ default: false })
  @Field()
  onboardingCompleted: boolean;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;
}