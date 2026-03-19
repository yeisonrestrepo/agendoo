import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeRole } from './entities/employee.entity';
import { EmployeeService } from './entities/employee-service.entity';
import { CreateEmployeeInput, UpdateEmployeeInput, AssignEmployeeServiceInput } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(EmployeeService)
    private employeeServicesRepository: Repository<EmployeeService>,
  ) {}

  async findByBusiness(businessId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { businessId, active: true },
    });
  }

  async findById(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async create(businessId: string, input: CreateEmployeeInput): Promise<Employee> {
    const existing = await this.employeesRepository.findOne({
      where: { userId: input.userId, businessId },
    });

    if (existing) {
      throw new BadRequestException('User is already an employee of this business');
    }

    const employee = this.employeesRepository.create({
      businessId,
      userId: input.userId,
      role: input.role || EmployeeRole.COLLABORATOR,
      specialties: input.specialties,
      tags: input.tags,
      categories: input.categories,
      fotoUrl: input.fotoUrl,
    });

    return this.employeesRepository.save(employee);
  }

  async update(employeeId: string, input: UpdateEmployeeInput): Promise<Employee> {
    const employee = await this.findById(employeeId);

    if (input.specialties !== undefined) employee.specialties = input.specialties;
    if (input.tags !== undefined) employee.tags = input.tags;
    if (input.categories !== undefined) employee.categories = input.categories;
    if (input.fotoUrl !== undefined) employee.fotoUrl = input.fotoUrl;
    if (input.active !== undefined) employee.active = input.active;
    if (input.isGeneric !== undefined) employee.isGeneric = input.isGeneric;

    return this.employeesRepository.save(employee);
  }

  async remove(employeeId: string): Promise<boolean> {
    const employee = await this.findById(employeeId);

    if (employee.role === EmployeeRole.OWNER) {
      throw new BadRequestException('Cannot remove the business owner');
    }

    await this.employeesRepository.remove(employee);
    return true;
  }

  async assignService(employeeId: string, input: AssignEmployeeServiceInput): Promise<EmployeeService> {
    const employee = await this.findById(employeeId);

    const existing = await this.employeeServicesRepository.findOne({
      where: { employeeId: employee.id, businessServiceId: input.businessServiceId },
    });

    if (existing) {
      throw new BadRequestException('Service already assigned to this employee');
    }

    const employeeService = this.employeeServicesRepository.create({
      employeeId: employee.id,
      businessServiceId: input.businessServiceId,
      customDuration: input.customDuration,
      customPrice: input.customPrice,
      skill: input.skill,
    });

    return this.employeeServicesRepository.save(employeeService);
  }

  async removeService(employeeServiceId: string): Promise<boolean> {
    const employeeService = await this.employeeServicesRepository.findOne({
      where: { id: employeeServiceId },
    });

    if (!employeeService) {
      throw new NotFoundException('Employee service assignment not found');
    }

    await this.employeeServicesRepository.remove(employeeService);
    return true;
  }

  async getEmployeeServices(employeeId: string): Promise<EmployeeService[]> {
    return this.employeeServicesRepository.find({
      where: { employeeId, active: true },
    });
  }
}
