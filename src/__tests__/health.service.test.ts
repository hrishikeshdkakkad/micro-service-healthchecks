import { HealthService } from '../health.service';
import { EmptyInitializationError } from '../common/errors/emptyInitializationError';
import { IHealthIndicator, ResourceHealth, Status } from '../base';

describe('Health service', () => {
  it('return an error if array is empty', () => {
    try {
      const healthService = new HealthService([]);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(EmptyInitializationError);
    }
  });

  it('Return healthy if all services are healthy', async () => {
    class mockHealthyService extends IHealthIndicator {
      async checkHealth(): Promise<Status> {
        return {
          name: 'Mock service - Healthy',
          health: ResourceHealth.Healthy,
        };
      }
    }
    const healthService = new HealthService([new mockHealthyService()]);
    let health = await healthService.getHealth();

    expect(health).toEqual({
      status: 'HEALTHY',
      results: [{ name: 'Mock service - Healthy', health: 'HEALTHY' }],
    });
  });

  it('Return Unhealthy if all services are Unhealthy', async () => {
    class mockUnHealthyService extends IHealthIndicator {
      async checkHealth(): Promise<Status> {
        return {
          name: 'Mock service - Unhealthy',
          health: ResourceHealth.Unhealthy,
        };
      }
    }
    const healthService = new HealthService([new mockUnHealthyService()]);
    let health = await healthService.getHealth();

    expect(health).toEqual({
      status: 'UNHEALTHY',
      results: [{ name: 'Mock service - Unhealthy', health: 'UNHEALTHY' }],
    });
  });

  it('Returns unhealthy even if one of services are unhealthy', async () => {
    class mockHealthyService extends IHealthIndicator {
      async checkHealth(): Promise<Status> {
        return {
          name: 'Mock service - Healthy',
          health: ResourceHealth.Healthy,
        };
      }
    }

    class mockUnHealthyService extends IHealthIndicator {
      async checkHealth(): Promise<Status> {
        return {
          name: 'Mock service - Unhealthy',
          health: ResourceHealth.Unhealthy,
        };
      }
    }

    const healthService = new HealthService([new mockHealthyService(), new mockUnHealthyService()]);
    let health = await healthService.getHealth();
    expect(health).toEqual({
      status: 'UNHEALTHY',
      results: [
        { name: 'Mock service - Healthy', health: 'HEALTHY' },
        { name: 'Mock service - Unhealthy', health: 'UNHEALTHY' },
      ],
    });
  });

  it('Return Unhealthy if the service throws an error -> and moves onto the next service', async () => {
    class mockErrorService extends IHealthIndicator {
      async checkHealth(): Promise<Status> {
        try {
          throw new Error('Errored service');
        } catch (error) {
          return {
            name: 'Mock service - Error',
            health: ResourceHealth.Unhealthy,
          };
        }
      }
    }
    const healthService = new HealthService([new mockErrorService()]);
    let health = await healthService.getHealth();

    expect(health).toEqual({
      status: 'UNHEALTHY',
      results: [{ name: 'Mock service - Error', health: 'UNHEALTHY' }],
    });
  });
});
