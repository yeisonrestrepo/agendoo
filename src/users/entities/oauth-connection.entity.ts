import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('oauth_connections')
@Index(['provider', 'providerId'], { unique: true })
@Index(['userId'])
export class OAuthConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  provider: string;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  providerEmail?: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.oauthConnections)
  user: User;
}