import { Connection, PublicKey } from '@solana/web3.js';
  

export default async function getTokenAccount(connection:Connection,walletAddress: string, mintAddress: string) {
    const wallet = new PublicKey(walletAddress);

    const account = await connection.getTokenAccountsByOwner(wallet, {
        mint: new PublicKey(mintAddress)
    });
    if (!account.value) {
        return undefined;
    }
    return account.value[0]?.pubkey?.toString() || undefined;
}