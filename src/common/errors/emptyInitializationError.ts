import { BaseError } from './base-error';

export class EmptyInitializationError extends BaseError {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, EmptyInitializationError.prototype);
  }
}
