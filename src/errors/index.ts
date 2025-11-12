/**
 * Base ZKFile error class
 */
export class ZKFileError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ZKFileError';
    Object.setPrototypeOf(this, ZKFileError.prototype);
  }
}

/**
 * Encryption-related errors
 */
export class EncryptionError extends ZKFileError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'EncryptionError';
    Object.setPrototypeOf(this, EncryptionError.prototype);
  }
}

/**
 * Storage-related errors
 */
export class StorageError extends ZKFileError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Solana blockchain errors
 */
export class SolanaError extends ZKFileError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'SolanaError';
    Object.setPrototypeOf(this, SolanaError.prototype);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends ZKFileError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
