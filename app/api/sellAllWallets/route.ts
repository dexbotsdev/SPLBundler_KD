import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { UserSetting } from "@/app/model/UserSettings";
import { pinata } from '@/lib/utils';
import { clusterApiUrl, ComputeBudgetProgram, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import bs58 from 'bs58'
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  AuthorityType,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import {
  getMint,
  getAccount,
  createInitializeAccountInstruction,
  createSetAuthorityInstruction,
  createBurnInstruction,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import {
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { LOOKUP_TABLE_CACHE,jsonInfo2PoolKeys, Liquidity, LiquidityPoolKeys } from "@raydium-io/raydium-sdk";
import { sendSignedTransactionLegacy } from "@/app/lib/transactions";
import { TokenMetadata } from "@/app/model/TokenMetadata";
import { formatAmmKeysById } from "@/app/lib/formatAmmKeysById";

import {performRaydiumSell} from '@/app/lib/Instructions'
import { ShyftExecutor ,submitBundleWithRetry} from "@/app/lib/ShyftExecutor";


export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {
    const prisma = new PrismaClient();

    const { tokenAddress,addressType, percentage } = await request.json();
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });
    const tokenMeta:   any = await prisma.tokenMetadata.findFirst({ where: { tokenAddress:tokenAddress,userId: userId } });
   
    let walletItems = await prisma.privateWallet.findMany({ where: { tokenAddress:tokenAddress, userId: userId } })

     if (addressType.equalsIgnoreCase("generated")) {
      walletItems = await prisma.generatedWallet.findMany({ where: { tokenAddress:tokenAddress, userId: userId } })

    }
 

    if (settings && walletItems &&  walletItems.length>0 ) {

      const tokenLauncherKP = settings?.launchPK
      const rpcUrl = settings?.rpcURL
      const tokenLauncherKeypair = Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
          
      const targetPoolInfo = await formatAmmKeysById(connection, tokenMeta.poolId)
      const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys
      poolKeys.id = new PublicKey(targetPoolInfo.id);

      const batchedSwaps: string[][] = [];
      let currentBatch: string[] = [];

      for(var i=0;i<walletItems.length;i++){

        let fromPK = Keypair.fromSecretKey(bs58.decode(walletItems[i].privateKey));
        const sellWalletInstructions = await performRaydiumSell(connection,fromPK,new PublicKey(tokenAddress),poolKeys,percentage)
        const transaction = new Transaction().add(...sellWalletInstructions);
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = fromPK.publicKey;
        const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: settings.priorityFee * LAMPORTS_PER_SOL })
        transaction.add(IXinstructions)
  
        console.log('Created Inxs ' + settings.enableDevnet)
        transaction.sign(fromPK)

        currentBatch.push(transaction.serialize().toString());

        // If we've reached 49 transactions or it's the last wallet, push the current batch
        if (currentBatch.length === 49 || i === walletItems.length - 1) {
          batchedSwaps.push(currentBatch);
          currentBatch = [];
        }
    }
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();


    const shyft = new ShyftExecutor(connection, settings.shyftApiKey, settings.enableDevnet)
    const bundlePromises = batchedSwaps.map(chunk =>
      submitBundleWithRetry(shyft, chunk, [], blockhash)
    );
    const responses = await Promise.allSettled(bundlePromises);

    return NextResponse.json({ status: true, message: 'Executed' }) 
      

    }



  } catch (error) {
    console.error('Failed to fetch settings:', error);
    //throw new Error('Failed to fetch settings'); 

    return NextResponse.json({ status: false, message: new String(error) })

  }


}