import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Connection } from "@solana/web3.js";
import { TransactionWithSigners } from "./global";



export async function signTransactions({
    transactionsAndSigners,
    wallet,
    connection,
  }: {
    transactionsAndSigners: TransactionWithSigners[];
    wallet: NodeWallet;
    connection: Connection;
  }) {
    if (!wallet.signAllTransactions) {
      throw new Error("Wallet not connected");
    }
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("max");
    transactionsAndSigners.forEach(({ transaction, signers = [] }) => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
  
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.setSigners(
        wallet.publicKey,
        ...signers.map((s) => s.publicKey)
      );
      if (signers?.length > 0) {
        transaction.partialSign(...signers);
      }
    });
  
    return await wallet.signAllTransactions(
      transactionsAndSigners.map((tnx:any) => tnx.transaction)
    );
  }
  