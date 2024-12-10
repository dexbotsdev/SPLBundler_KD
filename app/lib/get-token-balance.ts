import {  Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getMint } from '@solana/spl-token';
 
 

export default async function getTokenBalance(connection:Connection,tokenAccount: string) {
     const tokenWallet = new PublicKey(tokenAccount); 
    const info = await getAccount(connection, tokenWallet);
    const amount = Number(info.amount);
     const balance = amount ;
    return balance;
}