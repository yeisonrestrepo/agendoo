import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthResolver } from './health.resolver';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [ConfigModule],
  providers: [HealthResolver, HealthService],
  controllers: [HealthController],
  exports: [HealthService],
})
export class HealthModule {}