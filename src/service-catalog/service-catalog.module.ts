import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCatalog } from './entities/service-catalog.entity';
import { Category } from './entities/category.entity';
import { ServiceCatalogService } from './service-catalog.service';
import { ServiceCatalogResolver, CategoryResolver } from './service-catalog.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceCatalog, Category]),
  ],
  providers: [ServiceCatalogService, ServiceCatalogResolver, CategoryResolver],
  exports: [ServiceCatalogService, TypeOrmModule],
})
export class ServiceCatalogModule {}
