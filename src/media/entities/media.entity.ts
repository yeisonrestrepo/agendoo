import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MediaType {
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  WORK_SAMPLE = 'WORK_SAMPLE',
  BUSINESS_PHOTO = 'BUSINESS_PHOTO',
  DOCUMENT = 'DOCUMENT',
}

registerEnumType(MediaType, { name: 'MediaType' });

@Entity('media')
@ObjectType()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  ownerId: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
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
  @Field()
  size: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  altText?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  caption?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @ManyToOne(() => User)
  owner: User;
}