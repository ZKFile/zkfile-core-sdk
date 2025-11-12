import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { SolanaError } from '../errors';
import type { WalletAdapter } from '../types';

/**
 * Solana Service
 * Handles Solana blockchain interactions for access control and audit trails
 */
export class SolanaService {
  private connection: Connection;
  private programId?: PublicKey;

  constructor(rpcEndpoint: string, programId?: string) {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    if (programId) {
      this.programId = new PublicKey(programId);
    }
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get program ID
   */
  getProgramId(): PublicKey | undefined {
    return this.programId;
  }

  /**
   * Set program ID
   */
  setProgramId(programId: string): void {
    this.programId = new PublicKey(programId);
  }

  /**
   * Initialize file account on-chain
   */
  async initializeFile(
    fileId: string,
    cid: string,
    wallet: WalletAdapter
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new SolanaError('Wallet not connected', 'WALLET_NOT_CONNECTED');
    }

    if (!this.programId) {
      throw new SolanaError('Program ID not set', 'PROGRAM_ID_NOT_SET');
    }

    try {
      // Create instruction (placeholder - actual implementation would use program IDL)
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        ],
        programId: this.programId,
        data: Buffer.from(JSON.stringify({ fileId, cid })),
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign and send
      if (!wallet.signTransaction) {
        throw new SolanaError('Wallet does not support signing', 'SIGNING_NOT_SUPPORTED');
      }

      const signed = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signed.serialize());
      
      // Confirm transaction
      await this.connection.confirmTransaction(signature);

      return signature;
    } catch (error) {
      throw new SolanaError(
        `Failed to initialize file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INITIALIZE_FILE_FAILED'
      );
    }
  }

  /**
   * Grant access to a file
   */
  async grantAccess(
    fileId: string,
    recipient: PublicKey,
    expiresAt: number | undefined,
    wallet: WalletAdapter
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new SolanaError('Wallet not connected', 'WALLET_NOT_CONNECTED');
    }

    if (!this.programId) {
      throw new SolanaError('Program ID not set', 'PROGRAM_ID_NOT_SET');
    }

    try {
      // Create instruction (placeholder)
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: recipient, isSigner: false, isWritable: true },
        ],
        programId: this.programId,
        data: Buffer.from(JSON.stringify({ fileId, recipient: recipient.toBase58(), expiresAt })),
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      if (!wallet.signTransaction) {
        throw new SolanaError('Wallet does not support signing', 'SIGNING_NOT_SUPPORTED');
      }

      const signed = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signed.serialize());
      
      await this.connection.confirmTransaction(signature);

      return signature;
    } catch (error) {
      throw new SolanaError(
        `Failed to grant access: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GRANT_ACCESS_FAILED'
      );
    }
  }

  /**
   * Revoke access to a file
   */
  async revokeAccess(
    fileId: string,
    recipient: PublicKey,
    wallet: WalletAdapter
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new SolanaError('Wallet not connected', 'WALLET_NOT_CONNECTED');
    }

    if (!this.programId) {
      throw new SolanaError('Program ID not set', 'PROGRAM_ID_NOT_SET');
    }

    try {
      // Create instruction (placeholder)
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: recipient, isSigner: false, isWritable: true },
        ],
        programId: this.programId,
        data: Buffer.from(JSON.stringify({ fileId, recipient: recipient.toBase58() })),
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      if (!wallet.signTransaction) {
        throw new SolanaError('Wallet does not support signing', 'SIGNING_NOT_SUPPORTED');
      }

      const signed = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signed.serialize());
      
      await this.connection.confirmTransaction(signature);

      return signature;
    } catch (error) {
      throw new SolanaError(
        `Failed to revoke access: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REVOKE_ACCESS_FAILED'
      );
    }
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      throw new SolanaError(
        `Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_BALANCE_FAILED'
      );
    }
  }
}
