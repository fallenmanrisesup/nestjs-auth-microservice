import { Query, Resolver } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { InjectPubSub } from '../pubsub';
import { HealthService } from './health.service';

@Resolver()
export class HealthResolver {
  constructor(
    private readonly healthService: HealthService,
    @InjectPubSub()
    private readonly _pubsub: RedisPubSub,
  ) {}

  // replace <x> with service name
  @Query(() => Boolean)
  async xServiceHealth() {
    const healthResult = await this.healthService.check();
    return healthResult.status === 'ok';
  }
}
