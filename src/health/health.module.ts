// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthResolver } from './health.resolver';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [
    ConfigModule,
    // No necesitamos importar entidades específicas para health
  ],
  providers: [HealthResolver, HealthService],
  controllers: [HealthController],
  exports: [HealthService],
})
export class HealthModule {}