import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Professional } from '../../professionals/entities/professional.entity';
import { Amenity } from './amenity.entity';

@Entity('professional_amenities')
export class ProfessionalAmenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  professionalId: string;

  @Column()
  amenityId: string;

  @ManyToOne(() => Professional, { onDelete: 'CASCADE' })
  professional: Professional;

  @ManyToOne(() => Amenity, { onDelete: 'CASCADE' })
  amenity: Amenity;
}