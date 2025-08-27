import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Application root controller
 * 
 * Provides basic endpoints for health checking and system info
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * GET /health
   */
  @Get('health')
  getHealth(): object {
    return this.appService.getHealthCheck();
  }

  /**
   * Root endpoint with API info
   * GET /
   */
  @Get()
  getApiInfo(): object {
    return this.appService.getApiInfo();
  }
}