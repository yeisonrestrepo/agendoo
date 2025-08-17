// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async health() {
    return await this.healthService.getHealthCheck();
  }

  @Get('ping')
  ping() {
    return this.healthService.ping();
  }

  @Get('version')
  version() {
    return this.healthService.getVersion();
  }

  @Get('simple')
  simple() {
    return {
      status: 'healthy',
      message: 'Agendoo API is running!',
      timestamp: new Date().toISOString(),
    };
  }
}