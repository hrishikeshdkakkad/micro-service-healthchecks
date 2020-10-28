import { ResourceHealth, IHealthIndicator, Status } from './base';
import { EmptyInitializationError } from './common/errors/emptyInitializationError';

export class HealthService {
  private readonly checks: IHealthIndicator[];
  public overallHealth: ResourceHealth = ResourceHealth.Healthy;

  constructor(checks: IHealthIndicator[]) {
    if (checks.length === 0) {
      throw new EmptyInitializationError('Initialized with Zero dependencies');
    }
    this.checks = checks;
  }

  async getHealth(): Promise<HealthCheckResult | undefined> {
    try {
      const isHealthy = await Promise.all(this.checks.map((check) => check.checkHealth()));
      const anyUnhealthy = isHealthy.some((item) => item.health === ResourceHealth.Unhealthy);

      this.overallHealth = anyUnhealthy ? ResourceHealth.Unhealthy : ResourceHealth.Healthy;

      return {
        status: this.overallHealth,
        results: isHealthy,
      };
    } catch (error) {
      this.overallHealth = ResourceHealth.Unhealthy;
    }
  }
}

type HealthCheckResult = {
  status: ResourceHealth;
  results: Status[];
};
