export enum ResourceHealth {
  Healthy = 'HEALTHY',
  Unhealthy = 'UNHEALTHY',
}
export interface Status {
  name: string;
  health: ResourceHealth;
  details?: string;
}

export abstract class IHealthIndicator {
  url?: string;
  abstract checkHealth(): Promise<Status>;
}
