import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCatalog, ServiceCategory } from './entities/service-catalog.entity';
import { Category } from './entities/category.entity';
import { CreateServiceCatalogInput, UpdateServiceCatalogInput } from './dto/service-catalog.dto';

@Injectable()
export class ServiceCatalogService {
  constructor(
    @InjectRepository(ServiceCatalog)
    private catalogRepository: Repository<ServiceCatalog>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<ServiceCatalog[]> {
    return this.catalogRepository.find({
      where: { active: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findByCategory(category: ServiceCategory): Promise<ServiceCatalog[]> {
    return this.catalogRepository.find({
      where: { category, active: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<ServiceCatalog> {
    const service = await this.catalogRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Catalog service not found');
    }

    return service;
  }

  async create(input: CreateServiceCatalogInput): Promise<ServiceCatalog> {
    const service = this.catalogRepository.create(input);
    return this.catalogRepository.save(service);
  }

  async update(id: string, input: UpdateServiceCatalogInput): Promise<ServiceCatalog> {
    const service = await this.findById(id);

    if (input.name !== undefined) service.name = input.name;
    if (input.description !== undefined) service.description = input.description;
    if (input.defaultDuration !== undefined) service.defaultDuration = input.defaultDuration;
    if (input.active !== undefined) service.active = input.active;

    return this.catalogRepository.save(service);
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  async findAllCategories(activeOnly = true): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: activeOnly ? { active: true } : {},
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(input: { slug: string; name: string; description?: string; sortOrder?: number }): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({ where: { slug: input.slug } });

    if (existing) {
      throw new ConflictException(`Category with slug '${input.slug}' already exists`);
    }

    const category = this.categoriesRepository.create({
      slug: input.slug,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    });

    return this.categoriesRepository.save(category);
  }

  async updateCategory(
    id: string,
    input: { name?: string; description?: string; sortOrder?: number; active?: boolean },
  ): Promise<Category> {
    const category = await this.findCategoryById(id);

    if (input.name !== undefined) category.name = input.name;
    if (input.description !== undefined) category.description = input.description;
    if (input.sortOrder !== undefined) category.sortOrder = input.sortOrder;
    if (input.active !== undefined) category.active = input.active;

    return this.categoriesRepository.save(category);
  }
}
