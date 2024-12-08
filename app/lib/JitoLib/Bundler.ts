import { Keypair,PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export interface Bundler {
  sendBundle<T extends Transaction | VersionedTransaction>(
    txs: T[],
    signers:Keypair[],
    tipSender: PublicKey,
    tipAmount?: number
  ): Promise<[string, string[]]>;
} 