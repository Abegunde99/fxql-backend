/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { 
  HealthCheckResult, 
  HealthCheckService, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database health check
      async () => this.db.pingCheck('database', { timeout: 1000 }),
      
      // Memory health check
      async () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),     // 150MB
      async () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),       // 150MB
      
      // Disk health check
      async () => this.disk.checkStorage('storage', {
        thresholdPercent: 0.75,    // 75% threshold
        path: '/',
      }),
    ]);
  }

  async getDatabaseStatus(): Promise<boolean> {
    try {
      await this.db.pingCheck('database', { timeout: 1000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}