import { StorageError } from '../errors';

/**
 * Storage Service
 * Handles file upload/download to decentralized storage (IPFS/Arweave)
 */
export class StorageService {
  private ipfsGateway: string;
  private arweaveGateway: string;
  private provider: 'ipfs' | 'arweave';

  constructor(
    provider: 'ipfs' | 'arweave' = 'ipfs',
    ipfsGateway = 'https://ipfs.io/ipfs/',
    arweaveGateway = 'https://arweave.net/'
  ) {
    this.provider = provider;
    this.ipfsGateway = ipfsGateway;
    this.arweaveGateway = arweaveGateway;
  }

  /**
   * Upload encrypted data to storage
   */
  async upload(
    data: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      if (this.provider === 'ipfs') {
        return await this.uploadToIPFS(data, onProgress);
      } else {
        return await this.uploadToArweave(data, onProgress);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to upload to ${this.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPLOAD_FAILED'
      );
    }
  }

  /**
   * Download data from storage by CID
   */
  async download(
    cid: string,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    try {
      if (this.provider === 'ipfs') {
        return await this.downloadFromIPFS(cid, onProgress);
      } else {
        return await this.downloadFromArweave(cid, onProgress);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to download from ${this.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DOWNLOAD_FAILED'
      );
    }
  }

  /**
   * Upload to IPFS
   */
  private async uploadToIPFS(
    data: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Create FormData with the file
    const formData = new FormData();
    const blob = new Blob([data]);
    formData.append('file', blob);

    // Upload to IPFS gateway (using public gateway or custom endpoint)
    const uploadEndpoint = process.env.NEXT_PUBLIC_STORAGE_API_URL || 'https://upload.sgp.runfc.space';
    
    const response = await fetch(`${uploadEndpoint}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Return the CID or file URL
    return result.id || result.cid || result.url;
  }

  /**
   * Download from IPFS
   */
  private async downloadFromIPFS(
    cid: string,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    const url = `${this.ipfsGateway}${cid}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`IPFS download failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Upload to Arweave
   */
  private async uploadToArweave(
    data: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Placeholder for Arweave upload implementation
    // This would require Arweave wallet and transaction signing
    throw new StorageError('Arweave upload not yet implemented', 'NOT_IMPLEMENTED');
  }

  /**
   * Download from Arweave
   */
  private async downloadFromArweave(
    txId: string,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    const url = `${this.arweaveGateway}${txId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Arweave download failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Get storage provider
   */
  getProvider(): 'ipfs' | 'arweave' {
    return this.provider;
  }

  /**
   * Set storage provider
   */
  setProvider(provider: 'ipfs' | 'arweave'): void {
    this.provider = provider;
  }
}
