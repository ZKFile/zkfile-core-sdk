# 🔐 ZKFile Core SDK

> Official TypeScript SDK for ZKFile Protocol on Solana

[![npm version](https://badge.fury.io/js/%40zkfile%2Fcore-sdk.svg)](https://www.npmjs.com/package/@zkfile/core-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-14F195?logo=solana)](https://solana.com)

## Overview

ZKFile Core SDK enables developers to build privacy-first applications with:
- **Zero-Knowledge Encryption**: Client-side AES-256-GCM encryption
- **Solana Integration**: On-chain access control and audit trails
- **Decentralized Storage**: IPFS/Arweave integration
- **Cryptographic Proofs**: ZK-proof generation and verification

## Installation

```bash
npm install @zkfile/core-sdk
# or
yarn add @zkfile/core-sdk
# or
pnpm add @zkfile/core-sdk
```

## Quick Start

```typescript
import { ZKFileClient } from '@zkfile/core-sdk';
import { Connection, clusterApiUrl } from '@solana/web3.js';

// Initialize client
const zkfile = new ZKFileClient({
  rpcEndpoint: clusterApiUrl('mainnet-beta'),
  programId: 'ZKF...', // Optional: ZKFile Program ID
  storageProvider: 'ipfs'
});

// Upload encrypted file
const file = new File(['Hello ZKFile'], 'secret.txt');
const result = await zkfile.upload({
  file,
  password: 'secure-password',
  wallet: walletAdapter
});

console.log('File ID:', result.fileId);
console.log('CID:', result.cid);

// Download and decrypt file
const decrypted = await zkfile.download({
  fileId: result.fileId,
  password: 'secure-password',
  wallet: walletAdapter
});
```

## Features

### 🔒 Client-Side Encryption
- AES-256-GCM encryption algorithm
- PBKDF2 key derivation (100,000 iterations)
- Secure random IV generation
- Zero server-side key exposure

### ⚡ Solana Integration
- On-chain access control lists (ACL)
- Immutable audit trails
- Transaction-based permissions
- Program-derived addresses (PDA)

### 🔑 Zero-Knowledge Proofs
- Schema validation without data exposure
- Attribute verification
- Trustless data sharing
- Privacy-preserving credentials

### 📦 Decentralized Storage
- IPFS integration
- Arweave permanent storage
- Content addressing (CID)
- Redundant storage options

## API Reference

### `ZKFileClient`

#### Constructor
```typescript
new ZKFileClient(config: ZKFileConfig)
```

**Config Options:**
- `rpcEndpoint` (string): Solana RPC endpoint
- `programId` (string, optional): ZKFile program ID
- `storageProvider` ('ipfs' | 'arweave', optional): Storage provider
- `ipfsGateway` (string, optional): IPFS gateway URL
- `arweaveGateway` (string, optional): Arweave gateway URL

#### Methods

##### `upload(options: UploadOptions): Promise<UploadResult>`
Encrypts and uploads a file to decentralized storage.

```typescript
const result = await zkfile.upload({
  file: File | Blob,
  password: string,
  wallet: WalletAdapter,
  metadata?: {
    name?: string,
    description?: string,
    tags?: string[]
  },
  onProgress?: (progress: number) => void
});
```

**Returns:**
```typescript
{
  fileId: string,
  cid: string,
  signature: string,
  metadata: FileMetadata,
  uploadedAt: number
}
```

##### `download(options: DownloadOptions): Promise<File>`
Downloads and decrypts a file from storage.

```typescript
const file = await zkfile.download({
  fileId: string,
  password: string,
  wallet: WalletAdapter,
  onProgress?: (progress: number) => void
});
```

##### `share(options: ShareOptions): Promise<ShareResult>`
Grants access to another wallet address.

```typescript
const result = await zkfile.share({
  fileId: string,
  recipient: PublicKey,
  expiresAt?: number,
  wallet: WalletAdapter
});
```

**Returns:**
```typescript
{
  accessId: string,
  signature: string,
  recipient: PublicKey,
  expiresAt?: number
}
```

##### `revoke(options: RevokeOptions): Promise<string>`
Revokes access from a wallet address.

```typescript
const signature = await zkfile.revoke({
  fileId: string,
  recipient: PublicKey,
  wallet: WalletAdapter
});
```

## Examples

### React Integration

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { ZKFileClient } from '@zkfile/core-sdk';
import { Connection, clusterApiUrl } from '@solana/web3.js';

function UploadComponent() {
  const wallet = useWallet();
  const zkfile = new ZKFileClient({
    rpcEndpoint: clusterApiUrl('mainnet-beta')
  });

  const handleUpload = async (file: File) => {
    const result = await zkfile.upload({
      file,
      password: 'user-password',
      wallet
    });
    
    console.log('Uploaded:', result.fileId);
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />;
}
```

### Next.js API Route

```typescript
// app/api/upload/route.ts
import { ZKFileClient } from '@zkfile/core-sdk';
import { Connection } from '@solana/web3.js';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const zkfile = new ZKFileClient({
    rpcEndpoint: process.env.SOLANA_RPC_URL!
  });
  
  const result = await zkfile.upload({
    file,
    password: formData.get('password') as string,
    wallet: // ... wallet adapter
  });
  
  return Response.json(result);
}
```

## Security

### Encryption Details
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **IV Length**: 12 bytes (96 bits)
- **Salt Length**: 16 bytes (128 bits)
- **Tag Length**: 128 bits

### Best Practices
- Never hardcode passwords
- Use secure random password generation
- Implement proper key management
- Enable 2FA for wallet access
- Validate file sizes before upload
- Implement rate limiting

## Performance

| Operation | Time | Gas Cost |
|-----------|------|----------|
| Encrypt (1MB) | ~500ms | N/A |
| Decrypt (1MB) | ~400ms | N/A |
| Upload (1MB) | ~2.5s | 0.00001 SOL |
| Download (1MB) | ~1.8s | 0 SOL |
| Share Access | ~0.5s | 0.000005 SOL |
| Revoke Access | ~0.5s | 0.000005 SOL |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev

# Lint
npm run lint

# Format
npm run format
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

```bash
git clone https://github.com/zkfile/zkfile-core-sdk
cd zkfile-core-sdk
npm install
npm test
```

## License

MIT © 2025 ZKFile Tech

## Links

- 🌐 [Website](https://zkfile.tech)
- 📚 [Whitepaper](https://paper.zkfile.tech)
- 🐦 [X](https://twitter.com/ZKFile_Tech)
- 📧 [Email](mailto:team@zkfile.tech)

---

Built with ❤️ on Solana
