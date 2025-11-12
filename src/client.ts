import { PublicKey } from '@solana/web3.js';
import { EncryptionService } from './services/encryption';
import { StorageService } from './services/storage';
import { SolanaService } from './services/solana';
import { ZKProofService } from './services/zk-proof';
import { ValidationError } from './errors';
import type {
  ZKFileConfig,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  ShareOptions,
  ShareResult,
  RevokeOptions,
  FileMetadata,
} from './types';

/**
 * ZKFile Client
 * Main SDK client for interacting with ZKFile Protocol
 */
export class ZKFileClient {
  private encryption: EncryptionService;
  private storage: StorageService;
  private solana: SolanaService;
  private zkProof: ZKProofService;

  constructor(config: ZKFileConfig) {
    this.encryption = new EncryptionService();
    this.storage = new StorageService(
      config.storageProvider || 'ipfs',
      config.ipfsGateway,
      config.arweaveGateway
    );
    this.solana = new SolanaService(config.rpcEndpoint, config.programId);
    this.zkProof = new ZKProofService();
  }

  /**
   * Upload and encrypt a file
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    this.validateUploadOptions(options);

    const { file, password, wallet, metadata, onProgress } = options;

    // 1. Encrypt the file
    const encryptedFile = await this.encryption.encryptFile(file, password, metadata);
    
    // 2. Combine encrypted parts
    const combinedData = this.encryption.combineEncryptedParts(encryptedFile);

    // 3. Upload to storage
    const cid = await this.storage.upload(combinedData, onProgress);

    // 4. Generate file ID
    const fileId = this.generateFileId(cid);

    // 5. Initialize on-chain (optional - if program ID is set)
    let signature = '';
    if (this.solana.getProgramId()) {
      signature = await this.solana.initializeFile(fileId, cid, wallet);
    }

    // 6. Prepare metadata
    const fileMetadata: FileMetadata = {
      name: file instanceof File ? file.name : 'encrypted-file',
      type: file.type || 'application/octet-stream',
      size: file.size,
      description: metadata?.description,
      tags: metadata?.tags,
      createdAt: Date.now(),
    };

    return {
      fileId,
      cid,
      signature,
      metadata: fileMetadata,
      uploadedAt: Date.now(),
    };
  }

  /**
   * Download and decrypt a file
   */
  async download(options: DownloadOptions): Promise<File> {
    this.validateDownloadOptions(options);

    const { fileId, password, onProgress } = options;

    // 1. Get CID from fileId (in production, this would query on-chain data)
    const cid = this.extractCIDFromFileId(fileId);

    // 2. Download from storage
    const encryptedData = await this.storage.download(cid, onProgress);

    // 3. Split encrypted parts
    const encryptedFile = this.encryption.splitEncryptedParts(encryptedData);

    // 4. Decrypt the file
    const decryptedData = await this.encryption.decryptFile(encryptedFile, password);

    // 5. Create File object
    const blob = new Blob([decryptedData]);
    return new File([blob], 'decrypted-file', { type: 'application/octet-stream' });
  }

  /**
   * Share access to a file
   */
  async share(options: ShareOptions): Promise<ShareResult> {
    this.validateShareOptions(options);

    const { fileId, recipient, expiresAt, wallet } = options;

    // Grant access on-chain
    const signature = await this.solana.grantAccess(
      fileId,
      recipient,
      expiresAt,
      wallet
    );

    return {
      accessId: this.generateAccessId(fileId, recipient),
      signature,
      recipient,
      expiresAt,
    };
  }

  /**
   * Revoke access to a file
   */
  async revoke(options: RevokeOptions): Promise<string> {
    this.validateRevokeOptions(options);

    const { fileId, recipient, wallet } = options;

    // Revoke access on-chain
    return await this.solana.revokeAccess(fileId, recipient, wallet);
  }

  /**
   * Get encryption service
   */
  getEncryptionService(): EncryptionService {
    return this.encryption;
  }

  /**
   * Get storage service
   */
  getStorageService(): StorageService {
    return this.storage;
  }

  /**
   * Get Solana service
   */
  getSolanaService(): SolanaService {
    return this.solana;
  }

  /**
   * Get ZK-Proof service
   */
  getZKProofService(): ZKProofService {
    return this.zkProof;
  }

  // Private helper methods

  private validateUploadOptions(options: UploadOptions): void {
    if (!options.file) {
      throw new ValidationError('File is required', 'MISSING_FILE');
    }
    if (!options.password) {
      throw new ValidationError('Password is required', 'MISSING_PASSWORD');
    }
    if (!options.wallet || !options.wallet.publicKey) {
      throw new ValidationError('Wallet is required', 'MISSING_WALLET');
    }
  }

  private validateDownloadOptions(options: DownloadOptions): void {
    if (!options.fileId) {
      throw new ValidationError('File ID is required', 'MISSING_FILE_ID');
    }
    if (!options.password) {
      throw new ValidationError('Password is required', 'MISSING_PASSWORD');
    }
    if (!options.wallet || !options.wallet.publicKey) {
      throw new ValidationError('Wallet is required', 'MISSING_WALLET');
    }
  }

  private validateShareOptions(options: ShareOptions): void {
    if (!options.fileId) {
      throw new ValidationError('File ID is required', 'MISSING_FILE_ID');
    }
    if (!options.recipient) {
      throw new ValidationError('Recipient is required', 'MISSING_RECIPIENT');
    }
    if (!options.wallet || !options.wallet.publicKey) {
      throw new ValidationError('Wallet is required', 'MISSING_WALLET');
    }
  }

  private validateRevokeOptions(options: RevokeOptions): void {
    if (!options.fileId) {
      throw new ValidationError('File ID is required', 'MISSING_FILE_ID');
    }
    if (!options.recipient) {
      throw new ValidationError('Recipient is required', 'MISSING_RECIPIENT');
    }
    if (!options.wallet || !options.wallet.publicKey) {
      throw new ValidationError('Wallet is required', 'MISSING_WALLET');
    }
  }

  private generateFileId(cid: string): string {
    // Simple file ID generation (in production, use better method)
    return `zkf_${cid.substring(0, 16)}`;
  }

  private extractCIDFromFileId(fileId: string): string {
    // Extract CID from file ID (placeholder implementation)
    return fileId.replace('zkf_', '');
  }

  private generateAccessId(fileId: string, recipient: PublicKey): string {
    return `acc_${fileId}_${recipient.toBase58().substring(0, 8)}`;
  }
}
