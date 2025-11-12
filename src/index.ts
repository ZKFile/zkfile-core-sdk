/**
 * ZKFile Core SDK
 * Official TypeScript SDK for ZKFile Protocol
 * 
 * @packageDocumentation
 */

export { ZKFileClient } from './client';
export { EncryptionService } from './services/encryption';
export { StorageService } from './services/storage';
export { SolanaService } from './services/solana';
export { ZKProofService } from './services/zk-proof';

export type {
  ZKFileConfig,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  ShareOptions,
  ShareResult,
  RevokeOptions,
  FileMetadata,
  EncryptedFile,
  DecryptedFile,
  AccessControl,
  AuditLog,
} from './types';

export {
  ZKFileError,
  EncryptionError,
  StorageError,
  SolanaError,
  ValidationError,
} from './errors';
