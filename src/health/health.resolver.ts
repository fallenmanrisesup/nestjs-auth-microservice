import { Query, Resolver } from '@nestjs/graphql';
import { HealthService } from './health.service';

@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => Boolean)
  async notificationProcessorServiceHealth() {
    const healthResult = await this.healthService.check();
    return healthResult.status === 'ok';
  }
}
