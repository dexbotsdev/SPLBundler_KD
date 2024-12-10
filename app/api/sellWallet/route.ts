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


export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {
    const prisma = new PrismaClient();

    const { tokenAddress,address, percentage } = await request.json();
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });
    const tokenMeta:   any = await prisma.tokenMetadata.findFirst({ where: { tokenAddress:tokenAddress,userId: userId } });
   
    let walletItem = await prisma.privateWallet.findFirst({ where: { tokenAddress:tokenAddress,address: address, userId: userId } })

     if (!walletItem) {
      walletItem = await prisma.generatedWallet.findFirst({ where: { address: address, userId: userId } })

    }
 

    if (settings && walletItem && address) {

      const tokenLauncherKP = settings?.launchPK
      const rpcUrl = settings?.rpcURL
      const tokenLauncherKeypair = Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
      const ownerPubkey = tokenLauncherKeypair.publicKey
      const rent = await  connection.getMinimumBalanceForRentExemption(51)
      const fromPK = Keypair.fromSecretKey(bs58.decode(walletItem?.privateKey));
      const fromWallet = fromPK.publicKey;
      const balance = await connection.getBalance(fromWallet)
        
      const targetPoolInfo = await formatAmmKeysById(connection, tokenMeta.poolId)
      const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys
      poolKeys.id = new PublicKey(targetPoolInfo.id);

      const sellWalletInstructions = await performRaydiumSell(connection,fromPK,new PublicKey(tokenAddress),poolKeys,percentage)


      const transaction = new Transaction().add(...sellWalletInstructions);

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = fromWallet;
      const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: settings.priorityFee * LAMPORTS_PER_SOL })
      transaction.add(IXinstructions)

      console.log('Created Inxs ' + settings.enableDevnet)
      transaction.sign(fromPK)
     
      let status = '';

      status = await sendSignedTransactionLegacy({
        signedTransaction: transaction,
        connection,
        skipPreflight: false,
        successCallback: async (txSig: string) => {
          console.log('Sent Trasaction Success : Signature :' + txSig);
        },
        sendingCallback: async (txSig: string) => {
          console.log('Sent Trasaction awaiting Confirmation ' + txSig);
        },
        confirmStatus: async (txSig: string, confirmStatus: string) => {
          console.log('Recieved Transaction Confirmation :  ', txSig + ":" + confirmStatus);


        },
      });
      const signatureStatuses = await connection.getSignatureStatuses([
        status,
      ]);
      const result = signatureStatuses && signatureStatuses.value[0]?.err;

      if (result) {
        return NextResponse.json({ status: false, message: 'Transaction Failed' })

      }



      return NextResponse.json({
        status: !result
      })

    }



  } catch (error) {
    console.error('Failed to fetch settings:', error);
    //throw new Error('Failed to fetch settings'); 

    return NextResponse.json({ status: false, message: new String(error) })

  }


}