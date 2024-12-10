import { ShyftSdk, Network } from '@shyft-to/js';

import {
  BlockhashWithExpiryBlockHeight,
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
 

export class ShyftExecutor {
  shyft: ShyftSdk;
  constructor(private readonly connection: Connection, private readonly APIKEY: string,isDevNet:Boolean) {
    this.shyft = isDevNet ? new ShyftSdk({ apiKey: APIKEY, network: Network.Devnet }) : new ShyftSdk({ apiKey: APIKEY, network: Network.Mainnet });
  }

  public async executeAndConfirm(
    transaction: Transaction,
    payer: Keypair,
    latestBlockhash: BlockhashWithExpiryBlockHeight,
  ): Promise<{ confirmed: boolean; signature?: string, error?: string }> {
    console.log('Executing transaction...');
    const encodedTransaction = transaction.serialize().toString('base64');

    const signature = await this.shyft.transaction.send({
      network: this.shyft.config.network,
      encodedTransaction: encodedTransaction
    });

    console.log('Confirming transaction... ' + signature);
    return this.confirm(signature, latestBlockhash);
  }

  public async execute(transaction: Transaction | VersionedTransaction) {
    const encodedTransaction = transaction.serialize().toString('base64');

    return await this.shyft.transaction.send({
      network: this.shyft.config.network,
      encodedTransaction: encodedTransaction
    })

  }

  public async submitBundle(transactions: string[], payers: Keypair[], latestBlockhash: BlockhashWithExpiryBlockHeight, onAcceptedBundle: (arg0: any, arg1: any) => void) {
    const encodedTransactions: string[] = transactions

    const response = await this.shyft.transaction.sendMany({
      network: this.shyft.config.network,
      encodedTransactions: encodedTransactions
    }).catch(Error => {
      console.log(Error);
    })

    return response;
  }

  
  private async confirm(signature: string, latestBlockhash: BlockhashWithExpiryBlockHeight) {
    const confirmation = await this.connection.confirmTransaction(
      {
        signature,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
      },
      this.connection.commitment,
    );

    return { confirmed: !confirmation.value.err, signature };
  }
}


export async function submitBundleWithRetry(shyft: ShyftExecutor, chunk: string[], signers: Keypair[], blockhash: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await shyft.submitBundle(chunk, signers, blockhash, () => { });
      if (response && response.length > 0 && response.every(r => r.status === 'confirmed')) {
        return response;
      }
      console.log(`Attempt ${attempt} failed. Retrying...`);
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
    }
    // Wait for a short time before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Failed to submit bundle after ${maxRetries} attempts`);
}