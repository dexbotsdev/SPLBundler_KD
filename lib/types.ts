

export interface TokenMetadata {
  marketId?: string;
  poolId?: string;
  date?: number;
  tokenAddress?: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  image: string | null;
  imageHash: string | null;
  metaHash: string | null;
  description: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  revokeUpdate: boolean;
  revokeFreeze: boolean;
  revokeMint: boolean; 
  tnxId?: string;
}