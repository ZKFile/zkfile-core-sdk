import { PublicKey, Transaction } from '@solana/web3.js';

/**
 * ZKFile Client Configuration
 */
export interface ZKFileConfig {
  /** Solana RPC endpoint */
  rpcEndpoint: string;
  /** ZKFile program ID on Solana */
  programId?: string;
  /** Storage provider (ipfs, arweave) */
  storageProvider?: 'ipfs' | 'arweave';
  /** IPFS gateway URL */
  ipfsGateway?: string;
  /** Arweave gateway URL */
  arweaveGateway?: string;
}

/**
 * Wallet adapter interface
 */
export interface WalletAdapter {
  publicKey: PublicKey | null;
  signTransaction?: <T extends Transaction>(transaction: T) => Promise<T>;
  signAllTransactions?: <T extends Transaction>(transactions: T[]) => Promise<T[]>;
}

/**
 * File metadata
 */
export interface FileMetadata {
  /** Original filename */
  name: string;
  /** File MIME type */
  type: string;
  /** File size in bytes */
  size: number;
  /** Optional description */
  description?: string;
  /** Optional tags */
  tags?: string[];
  /** Creation timestamp */
  createdAt?: number;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** File to upload */
  file: File | Blob;
  /** Encryption password */
  password: string;
  /** Wallet adapter */
  wallet: WalletAdapter;
  /** Optional metadata */
  metadata?: Partial<FileMetadata>;
  /** Optional callback for progress */
  onProgress?: (progress: number) => void;
}

/**
 * Upload result
 */
export interface UploadResult {
  /** Unique file ID */
  fileId: string;
  /** Content identifier (CID) */
  cid: string;
  /** Solana transaction signature */
  signature: string;
  /** File metadata */
  metadata: FileMetadata;
  /** Upload timestamp */
  uploadedAt: number;
}

/**
 * Download options
 */
export interface DownloadOptions {
  /** File ID to download */
  fileId: string;
  /** Decryption password */
  password: string;
  /** Wallet adapter */
  wallet: WalletAdapter;
  /** Optional callback for progress */
  onProgress?: (progress: number) => void;
}

/**
 * Share options
 */
export interface ShareOptions {
  /** File ID to share */
  fileId: string;
  /** Recipient public key */
  recipient: PublicKey;
  /** Optional expiration timestamp */
  expiresAt?: number;
  /** Wallet adapter */
  wallet: WalletAdapter;
}

/**
 * Share result
 */
export interface ShareResult {
  /** Access control ID */
  accessId: string;
  /** Solana transaction signature */
  signature: string;
  /** Recipient public key */
  recipient: PublicKey;
  /** Expiration timestamp */
  expiresAt?: number;
}

/**
 * Revoke options
 */
export interface RevokeOptions {
  /** File ID */
  fileId: string;
  /** Recipient public key to revoke */
  recipient: PublicKey;
  /** Wallet adapter */
  wallet: WalletAdapter;
}

/**
 * Encrypted file structure
 */
export interface EncryptedFile {
  /** Initialization vector */
  iv: Uint8Array;
  /** Salt for key derivation */
  salt: Uint8Array;
  /** Encrypted data */
  ciphertext: Uint8Array;
  /** Authentication tag */
  authTag?: Uint8Array;
}

/**
 * Decrypted file structure
 */
export interface DecryptedFile {
  /** File data */
  data: Uint8Array;
  /** File metadata */
  metadata: FileMetadata;
}

/**
 * Access control entry
 */
export interface AccessControl {
  /** File ID */
  fileId: string;
  /** Owner public key */
  owner: PublicKey;
  /** Recipient public key */
  recipient: PublicKey;
  /** Granted timestamp */
  grantedAt: number;
  /** Expiration timestamp */
  expiresAt?: number;
  /** Revoked status */
  revoked: boolean;
}

/**
 * Audit log entry
 */
export interface AuditLog {
  /** File ID */
  fileId: string;
  /** Action type */
  action: 'upload' | 'download' | 'share' | 'revoke' | 'delete';
  /** Actor public key */
  actor: PublicKey;
  /** Timestamp */
  timestamp: number;
  /** Transaction signature */
  signature: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * ZK-Proof structure
 */
export interface ZKProof {
  /** Proof data */
  proof: Uint8Array;
  /** Public inputs */
  publicInputs: Uint8Array;
  /** Verification key */
  verificationKey?: Uint8Array;
}
