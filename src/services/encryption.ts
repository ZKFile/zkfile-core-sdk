import { EncryptionError } from '../errors';
import type { EncryptedFile, DecryptedFile, FileMetadata } from '../types';

/**
 * Encryption Service
 * Implements AES-256-GCM encryption with PBKDF2 key derivation
 * Based on the existing implementation in lib/crypto/encryption.ts
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly PBKDF2_ITERATIONS = 100000;
  private static readonly TAG_LENGTH = 128;

  /**
   * Encrypt a file with AES-256-GCM
   */
  async encryptFile(
    file: File | Blob,
    password: string,
    metadata?: Partial<FileMetadata>
  ): Promise<EncryptedFile> {
    try {
      // Generate random IV and salt
      const iv = crypto.getRandomValues(new Uint8Array(EncryptionService.IV_LENGTH));
      const salt = crypto.getRandomValues(new Uint8Array(EncryptionService.SALT_LENGTH));

      // Derive key from password using PBKDF2
      const key = await this.deriveKey(password, salt);

      // Read file data
      const fileData = await this.fileToArrayBuffer(file);

      // Encrypt the data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: EncryptionService.ALGORITHM,
          iv,
          tagLength: EncryptionService.TAG_LENGTH,
        },
        key,
        fileData
      );

      return {
        iv,
        salt,
        ciphertext: new Uint8Array(encryptedData),
      };
    } catch (error) {
      throw new EncryptionError(
        `Failed to encrypt file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ENCRYPTION_FAILED'
      );
    }
  }

  /**
   * Decrypt a file with AES-256-GCM
   */
  async decryptFile(
    encryptedFile: EncryptedFile,
    password: string
  ): Promise<Uint8Array> {
    try {
      // Derive key from password using the same salt
      const key = await this.deriveKey(password, encryptedFile.salt);

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: EncryptionService.ALGORITHM,
          iv: encryptedFile.iv,
          tagLength: EncryptionService.TAG_LENGTH,
        },
        key,
        encryptedFile.ciphertext
      );

      return new Uint8Array(decryptedData);
    } catch (error) {
      throw new EncryptionError(
        `Failed to decrypt file: ${error instanceof Error ? error.message : 'Invalid password or corrupted data'}`,
        'DECRYPTION_FAILED'
      );
    }
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    try {
      // Import password as key material
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      // Derive AES key
      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: EncryptionService.PBKDF2_ITERATIONS,
          hash: 'SHA-256',
        },
        passwordKey,
        {
          name: EncryptionService.ALGORITHM,
          length: EncryptionService.KEY_LENGTH,
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      throw new EncryptionError(
        `Failed to derive key: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'KEY_DERIVATION_FAILED'
      );
    }
  }

  /**
   * Convert File/Blob to ArrayBuffer
   */
  private fileToArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Combine encrypted file parts into a single Uint8Array
   * Format: [IV (12 bytes)][Salt (16 bytes)][Ciphertext]
   */
  combineEncryptedParts(encryptedFile: EncryptedFile): Uint8Array {
    const combined = new Uint8Array(
      encryptedFile.iv.length +
      encryptedFile.salt.length +
      encryptedFile.ciphertext.length
    );

    combined.set(encryptedFile.iv, 0);
    combined.set(encryptedFile.salt, encryptedFile.iv.length);
    combined.set(
      encryptedFile.ciphertext,
      encryptedFile.iv.length + encryptedFile.salt.length
    );

    return combined;
  }

  /**
   * Split combined encrypted data into parts
   * Format: [IV (12 bytes)][Salt (16 bytes)][Ciphertext]
   */
  splitEncryptedParts(combinedData: Uint8Array): EncryptedFile {
    if (combinedData.length < EncryptionService.IV_LENGTH + EncryptionService.SALT_LENGTH) {
      throw new EncryptionError(
        'Invalid encrypted data: too short',
        'INVALID_ENCRYPTED_DATA'
      );
    }

    const iv = combinedData.slice(0, EncryptionService.IV_LENGTH);
    const salt = combinedData.slice(
      EncryptionService.IV_LENGTH,
      EncryptionService.IV_LENGTH + EncryptionService.SALT_LENGTH
    );
    const ciphertext = combinedData.slice(
      EncryptionService.IV_LENGTH + EncryptionService.SALT_LENGTH
    );

    return { iv, salt, ciphertext };
  }

  /**
   * Generate a random encryption key
   */
  async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: EncryptionService.ALGORITHM,
        length: EncryptionService.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export key to raw format
   */
  async exportKey(key: CryptoKey): Promise<Uint8Array> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exported);
  }

  /**
   * Import key from raw format
   */
  async importKey(keyData: Uint8Array): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      EncryptionService.ALGORITHM,
      true,
      ['encrypt', 'decrypt']
    );
  }
}
