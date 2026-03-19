import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum MediaType {
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  /** Employee portfolio image. */
  WORK_SAMPLE = 'WORK_SAMPLE',
  /** Business gallery image. */
  BUSINESS_PHOTO = 'BUSINESS_PHOTO',
  /** Business cover or banner image. */
  BUSINESS_COVER = 'BUSINESS_COVER',
  DOCUMENT = 'DOCUMENT',
}

registerEnumType(MediaType, { name: 'MediaType' });

@Entity('media')
@Index(['businessId'])
@Index(['employeeId'])
@Index(['ownerId'])
@ObjectType()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  ownerId: string;

  @Column({ nullable: true })
  businessId?: string;

  @Column({ nullable: true })
  employeeId?: string;

  @Column({ type: 'enum', enum: MediaType })
  @Field(() => MediaType)
  type: MediaType;

  @Column()
  @Field()
  url: string;

  @Column()
  @Field()
  filename: string;

  @Column()
  @Field()
  mimeType: string;

  @Column()
  @Field(() => Int)
  size: number;

  /** Image width in pixels. Null for non-image media types. */
  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  width?: number;

  /** Image height in pixels. Null for non-image media types. */
  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  height?: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  altText?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  caption?: string;

  @Column({ default: 0 })
  @Field(() => Int)
  sortOrder: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => Business, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Field(() => Business, { nullable: true })
  business?: Business;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  @Field(() => Employee, { nullable: true })
  employee?: Employee;
}