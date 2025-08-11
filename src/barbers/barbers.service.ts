import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barber } from './entities/barber.entity';
import { Service } from './entities/service.entity';
import { CreateServiceInput } from './dto/barber.dto';

@Injectable()
export class BarbersService {
  constructor(
    @InjectRepository(Barber)
    private barbersRepository: Repository<Barber>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async findAll(): Promise<Barber[]> {
    return this.barbersRepository.find({
      relations: ['user', 'user.profile', 'services'],
    });
  }

  async findById(id: string): Promise<Barber> {
    const barber = await this.barbersRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'services'],
    });

    if (!barber) {
      throw new NotFoundException('Barbero no encontrado');
    }

    return barber;
  }

  async findByUserId(userId: string): Promise<Barber | null> {
    return this.barbersRepository.findOne({
      where: { userId },
      relations: ['user', 'user.profile', 'services'],
    });
  }

  async createService(barberId: string, input: CreateServiceInput): Promise<Service> {
    const barber = await this.findById(barberId);
    
    const service = this.servicesRepository.create({
      barberId: barber.id,
      ...input,
    });

    return this.servicesRepository.save(service);
  }

  async getServices(barberId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { barberId, active: true },
    });
  }
}