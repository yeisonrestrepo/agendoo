import { Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HealthResponse, VersionResponse, DatabaseHealthResponse } from './health.types';

@Resolver()
export class HealthResolver {
  constructor(
    private readonly configService: ConfigService,
    @Inject(DataSource) private readonly dataSource: DataSource,
  ) {}

  @Query(() => HealthResponse, { description: 'Health check endpoint' })
  async health(): Promise<HealthResponse> {
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

    return {
      status: 'healthy',
      message: 'Agendoo API is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV') || 'development',
      uptime: uptimeString,
    };
  }

  @Query(() => String, { description: 'Simple health check' })
  ping(): string {
    return 'pong';
  }

  @Query(() => VersionResponse, { description: 'API version information' })
  version(): VersionResponse {
    return {
      version: '1.0.0',
      name: 'Agendoo API',
      environment: this.configService.get('NODE_ENV') || 'development',
      nodeVersion: process.version,
      buildTime: new Date().toISOString(),
    };
  }

  @Query(() => DatabaseHealthResponse, { description: 'Database health check' })
  async databaseHealth(): Promise<DatabaseHealthResponse> {
    try {
      const startTime = Date.now();
      
      await this.dataSource.query('SELECT 1');
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        connected: true,
        host: this.configService.get('DB_HOST'),
        database: this.configService.get('DB_NAME'),
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        host: this.configService.get('DB_HOST'),
        database: this.configService.get('DB_NAME'),
      };
    }
  }

  @Query(() => String, { description: 'Current server timestamp' })
  timestamp(): string {
    return new Date().toISOString();
  }

  @Query(() => String, { description: 'Server environment' })
  environment(): string {
    return this.configService.get('NODE_ENV') || 'development';
  }
}