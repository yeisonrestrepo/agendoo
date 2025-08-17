// src/health/health.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
  version: string;
  environment: string;
  uptime: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: string;
      free: string;
      total: string;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(DataSource) private readonly dataSource: DataSource,
  ) {}

  async getHealthCheck(): Promise<HealthCheck> {
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
    
    // Check database
    const databaseCheck = await this.checkDatabase();
    
    // Check memory
    const memoryUsage = process.memoryUsage();
    const memoryCheck = {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      free: `${Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024)} MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    };

    const overallStatus = databaseCheck.status === 'healthy' ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      message: 'Agendoo API Health Check',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV') || 'development',
      uptime: uptimeString,
      checks: {
        database: databaseCheck,
        memory: memoryCheck,
      },
    };
  }

  private async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
    try {
      const startTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'Agendoo API',
      description: 'Plataforma de servicios de belleza',
      environment: this.configService.get('NODE_ENV') || 'development',
      nodeVersion: process.version,
      buildTime: new Date().toISOString(),
    };
  }

  ping(): { message: string; timestamp: string } {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}