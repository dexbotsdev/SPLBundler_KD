import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { UserSetting } from "@/app/model/UserSettings";
import {
  clusterApiUrl, TransactionInstruction, ComputeBudgetProgram, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction,
  SystemProgram
} from "@solana/web3.js";
import bs58 from 'bs58'
import {
  getMint,
} from "@solana/spl-token";
import { sendSignedTransactionLegacy, signTransactions } from "@/app/lib/transactions";
import {
  ENDPOINT as _ENDPOINT,
  LOOKUP_TABLE_CACHE,
  TOKEN_PROGRAM_ID,
  DEVNET_PROGRAM_ID,
  MAINNET_PROGRAM_ID,
  SOL
} from '@raydium-io/raydium-sdk';
import { DEFAULT_TOKEN, TransactionWithSigners } from "@/app/lib/global";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

import { getVaultOwnerAndNonce } from '../../lib/serum'
import { ACCOUNT_SIZE, createInitializeAccountInstruction } from '@solana/spl-token';
import { BN } from "@project-serum/anchor";
import { DexInstructions, Market } from "@project-serum/serum";




export async function POST(request: Request) {
  const { userId } = await auth();

   
  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {

    const body = await request.json();
   const  {
      baseTokenMint,
      privateWallets,
      generatedWallets 
    } = body;
    const prisma = new PrismaClient();


    const tokenMetaOld = await prisma.tokenMetadata.findFirst({ where: { tokenAddress: baseTokenMint, userId: userId } })

    if(tokenMetaOld){ 

      const pwallets =[];
      const gwallets =[];


      for(var i=0;i<privateWallets.length;i++){
        pwallets.push({
          tokenAddress: baseTokenMint,
          privateKey : privateWallets[i].privateKey,
          address: privateWallets[i].address,
          snipeAmount: ''+privateWallets[i].snipeAmount, 
          userId:userId
        })
      }

      await prisma.privateWallet.deleteMany({where :{tokenAddress: baseTokenMint, userId: userId }})
       

      await prisma.privateWallet.createMany({data :pwallets})

      for(var i=0;i<generatedWallets.length;i++){
        gwallets.push({
          tokenAddress: baseTokenMint,
          privateKey : generatedWallets[i].privateKey,
          address: generatedWallets[i].address,
          snipeAmount: ''+generatedWallets[i].snipeAmount, 
          userId:userId
        })
      }


      await prisma.generatedWallet.deleteMany({where :{tokenAddress: baseTokenMint, userId: userId }}) 
      await prisma.generatedWallet.createMany({data :gwallets})

    }else {
      throw Error('Unable to Execute Transaction, Failed or TimeOut Occured')
    } 
    
  } catch (error) {
    console.error('Failed to save settings:', error);
    //throw new Error('Failed to fetch settings'); 

    return NextResponse.json({ status: false, message: new String(error) })

  }
  return NextResponse.json({
    status: true,
    message: `PoolInfo   Created`
  })

}