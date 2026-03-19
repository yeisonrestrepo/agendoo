import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as DataLoader from 'dataloader';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { BusinessService } from '../../businesses/entities/business-service.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Review } from '../../reviews/entities/review.entity';

@Injectable({ scope: Scope.REQUEST })
export class DataloaderService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Business)
    private businessesRepository: Repository<Business>,
    @InjectRepository(BusinessService)
    private businessServicesRepository: Repository<BusinessService>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  readonly usersById = new DataLoader<string, User>(async (ids) => {
    const users = await this.usersRepository.find({
      where: { id: In([...ids]) },
      relations: ['profile'],
    });
    const map = new Map(users.map(u => [u.id, u]));
    return ids.map(id => map.get(id) ?? new Error(`User ${id} not found`));
  });

  readonly businessesById = new DataLoader<string, Business>(async (ids) => {
    const businesses = await this.businessesRepository.find({
      where: { id: In([...ids]) },
    });
    const map = new Map(businesses.map(b => [b.id, b]));
    return ids.map(id => map.get(id) ?? new Error(`Business ${id} not found`));
  });

  readonly businessServicesById = new DataLoader<string, BusinessService>(async (ids) => {
    const services = await this.businessServicesRepository.find({
      where: { id: In([...ids]) },
      relations: ['catalogService'],
    });
    const map = new Map(services.map(s => [s.id, s]));
    return ids.map(id => map.get(id) ?? new Error(`BusinessService ${id} not found`));
  });

  readonly employeesById = new DataLoader<string, Employee | null>(async (ids) => {
    const employees = await this.employeesRepository.find({
      where: { id: In([...ids]) },
    });
    const map = new Map(employees.map(e => [e.id, e]));
    return ids.map(id => map.get(id) ?? null);
  });

  readonly employeesByBusinessId = new DataLoader<string, Employee[]>(async (businessIds) => {
    const employees = await this.employeesRepository.find({
      where: { businessId: In([...businessIds]), active: true },
    });
    const map = new Map<string, Employee[]>();
    for (const emp of employees) {
      const list = map.get(emp.businessId) || [];
      list.push(emp);
      map.set(emp.businessId, list);
    }
    return businessIds.map(id => map.get(id) ?? []);
  });

  readonly businessServicesByBusinessId = new DataLoader<string, BusinessService[]>(async (businessIds) => {
    const services = await this.businessServicesRepository.find({
      where: { businessId: In([...businessIds]), active: true },
      relations: ['catalogService'],
    });
    const map = new Map<string, BusinessService[]>();
    for (const svc of services) {
      const list = map.get(svc.businessId) || [];
      list.push(svc);
      map.set(svc.businessId, list);
    }
    return businessIds.map(id => map.get(id) ?? []);
  });

  readonly reviewsByBusinessId = new DataLoader<string, Review[]>(async (businessIds) => {
    const reviews = await this.reviewsRepository.find({
      where: { businessId: In([...businessIds]) },
      order: { createdAt: 'DESC' },
    });
    const map = new Map<string, Review[]>();
    for (const rev of reviews) {
      const list = map.get(rev.businessId) || [];
      list.push(rev);
      map.set(rev.businessId, list);
    }
    return businessIds.map(id => map.get(id) ?? []);
  });
}
