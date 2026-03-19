import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { ServiceCatalog, ServiceCategory } from './entities/service-catalog.entity';
import { Category } from './entities/category.entity';
import { ServiceCatalogService } from './service-catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateServiceCatalogInput, UpdateServiceCatalogInput } from './dto/service-catalog.dto';
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

@InputType()
class CreateCategoryInput {
  @Field() @IsString() slug: string;
  @Field() @IsString() name: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsNumber() @Min(0) sortOrder?: number;
}

@InputType()
class UpdateCategoryInput {
  @Field({ nullable: true }) @IsOptional() @IsString() name?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsNumber() @Min(0) sortOrder?: number;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() active?: boolean;
}

@Resolver(() => ServiceCatalog)
export class ServiceCatalogResolver {
  constructor(private serviceCatalogService: ServiceCatalogService) {}

  @Query(() => [ServiceCatalog])
  async getServiceCatalog(): Promise<ServiceCatalog[]> {
    return this.serviceCatalogService.findAll();
  }

  @Query(() => [ServiceCatalog])
  async getServiceCatalogByCategory(
    @Args('category', { type: () => ServiceCategory }) category: ServiceCategory,
  ): Promise<ServiceCatalog[]> {
    return this.serviceCatalogService.findByCategory(category);
  }

  @Query(() => ServiceCatalog)
  async getServiceCatalogItem(@Args('id') id: string): Promise<ServiceCatalog> {
    return this.serviceCatalogService.findById(id);
  }

  @Mutation(() => ServiceCatalog)
  @UseGuards(JwtAuthGuard)
  async createServiceCatalogItem(
    @CurrentUser() user: User,
    @Args('input') input: CreateServiceCatalogInput,
  ): Promise<ServiceCatalog> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can manage the service catalog');
    }

    return this.serviceCatalogService.create(input);
  }

  @Mutation(() => ServiceCatalog)
  @UseGuards(JwtAuthGuard)
  async updateServiceCatalogItem(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') input: UpdateServiceCatalogInput,
  ): Promise<ServiceCatalog> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can manage the service catalog');
    }

    return this.serviceCatalogService.update(id, input);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private serviceCatalogService: ServiceCatalogService) {}

  @Query(() => [Category])
  async getCategories(): Promise<Category[]> {
    return this.serviceCatalogService.findAllCategories();
  }

  @Query(() => Category)
  async getCategory(@Args('id', { type: () => ID }) id: string): Promise<Category> {
    return this.serviceCatalogService.findCategoryById(id);
  }

  @Mutation(() => Category)
  @UseGuards(JwtAuthGuard)
  async createCategory(
    @CurrentUser() user: User,
    @Args('input') input: CreateCategoryInput,
  ): Promise<Category> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can manage categories');
    }

    return this.serviceCatalogService.createCategory(input);
  }

  @Mutation(() => Category)
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<Category> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can manage categories');
    }

    return this.serviceCatalogService.updateCategory(id, input);
  }
}
