import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient, UserSetting } from "@prisma/client";
import {
  ENDPOINT as _ENDPOINT} from '@raydium-io/raydium-sdk'; 
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";



interface Wallet {
  address: string
  tokenBalance: string
  solBalance: string
  snipeAmount: string
}

export async function POST(request: Request) {
  const { userId } = await auth();

   
  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {

    const body = await request.json();
    const { privateKey, wallets } = body

    const prisma = new PrismaClient();

    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });


    if (settings) {
      const rpcUrl = settings?.rpcURL
      const airdropWallet = Keypair.fromSecretKey(bs58.decode(privateKey)); 
      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
      const { successfulTransfers, failedTransfers } = await batchedSolTransfer(connection, airdropWallet, wallets)

      return NextResponse.json({
        success: true,
        message: `Airdropped SOL to generated wallets. Successful: ${successfulTransfers}, Failed: ${failedTransfers}`,
        successfulTransfers,
        failedTransfers
      })


    }else {
      throw Error('Unable to Execute Transaction, Failed or TimeOut Occured')
    } 
    
  } catch (error) {
    console.error('Failed to save settings:', error);
    //throw new Error('Failed to fetch settings'); 

    return NextResponse.json({ status: false, message: new String(error) })

  }
  

}

async function batchedSolTransfer(connection: Connection, airdropWallet: Keypair, wallets: any): Promise<{ successfulTransfers: any; failedTransfers: any; } | PromiseLike<{ successfulTransfers: any; failedTransfers: any; }>> {
 

  const batchSize = 10
  const batches = Math.ceil(wallets.length / batchSize)
  let successfulTransfers = 0
  let failedTransfers = 0

  for (let i = 0; i < batches; i++) {
    const batchWallets = wallets.slice(i * batchSize, (i + 1) * batchSize)
    const transaction = new  Transaction()

    for (const wallet of batchWallets) {
      const transferInstruction =  SystemProgram.transfer({
        fromPubkey: airdropWallet.publicKey,
        toPubkey: new  PublicKey(wallet.address),
        lamports:Number(Number( LAMPORTS_PER_SOL * Number(wallet.snipeAmount)).toFixed(0))
      })
      transaction.add(transferInstruction)
    }

    try {
      const signature = await  sendAndConfirmTransaction(connection, transaction, [airdropWallet])
      console.log(`Batch ${i + 1} transfer successful. Signature: ${signature}`)
      successfulTransfers += batchWallets.length
    } catch (error) {
      console.error(`Error in batch ${i + 1} transfer:`, error)
      failedTransfers += batchWallets.length
    }
  }

  return { successfulTransfers, failedTransfers }


}
