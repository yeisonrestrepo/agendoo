import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './entities/employee-service.entity';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateEmployeeInput, UpdateEmployeeInput, AssignEmployeeServiceInput } from './dto/employee.dto';
import { DataloaderService } from '../common/dataloaders/dataloader.service';

@Resolver(() => Employee)
export class EmployeesResolver {
  constructor(
    private employeesService: EmployeesService,
    private businessesService: BusinessesService,
    private loaders: DataloaderService,
  ) {}

  @ResolveField(() => User)
  async user(@Parent() employee: Employee): Promise<User> {
    if (employee.user) return employee.user;
    return this.loaders.usersById.load(employee.userId);
  }

  @ResolveField(() => Business)
  async business(@Parent() employee: Employee): Promise<Business> {
    if (employee.business) return employee.business;
    return this.loaders.businessesById.load(employee.businessId);
  }

  @Query(() => [Employee])
  async getEmployees(@Args('businessId') businessId: string): Promise<Employee[]> {
    return this.employeesService.findByBusiness(businessId);
  }

  @Query(() => Employee)
  async getEmployee(@Args('id') id: string): Promise<Employee> {
    return this.employeesService.findById(id);
  }

  @Query(() => [EmployeeService])
  async getEmployeeServices(@Args('employeeId') employeeId: string): Promise<EmployeeService[]> {
    return this.employeesService.getEmployeeServices(employeeId);
  }

  @Mutation(() => Employee)
  @UseGuards(JwtAuthGuard)
  async addEmployee(
    @CurrentUser() user: User,
    @Args('input') input: CreateEmployeeInput,
  ): Promise<Employee> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can add employees');
    }

    const business = await this.businessesService.findByOwnerId(user.id);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.employeesService.create(business.id, input);
  }

  @Mutation(() => Employee)
  @UseGuards(JwtAuthGuard)
  async updateEmployee(
    @CurrentUser() user: User,
    @Args('employeeId') employeeId: string,
    @Args('input') input: UpdateEmployeeInput,
  ): Promise<Employee> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can update employees');
    }

    return this.employeesService.update(employeeId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeEmployee(
    @CurrentUser() user: User,
    @Args('employeeId') employeeId: string,
  ): Promise<boolean> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can remove employees');
    }

    return this.employeesService.remove(employeeId);
  }

  @Mutation(() => EmployeeService)
  @UseGuards(JwtAuthGuard)
  async assignEmployeeService(
    @CurrentUser() user: User,
    @Args('employeeId') employeeId: string,
    @Args('input') input: AssignEmployeeServiceInput,
  ): Promise<EmployeeService> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can assign services to employees');
    }

    return this.employeesService.assignService(employeeId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeEmployeeService(
    @CurrentUser() user: User,
    @Args('employeeServiceId') employeeServiceId: string,
  ): Promise<boolean> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can remove employee services');
    }

    return this.employeesService.removeService(employeeServiceId);
  }
}
