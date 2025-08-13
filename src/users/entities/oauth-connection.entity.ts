import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('oauth_connections')
export class OAuthConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  provider: string; // 'google', 'facebook', 'apple'

  @Column()
  providerId: string;

  @Column()
  providerEmail: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.oauthConnections)
  user: User;
}