import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  ENDPOINT as _ENDPOINT,
  MARKET_STATE_LAYOUT_V3,
  Token, DEVNET_PROGRAM_ID, MAINNET_PROGRAM_ID,
  TOKEN_PROGRAM_ID, Liquidity, TokenAmount
} from '@raydium-io/raydium-sdk';
import { LaunchData } from "@/types";
import { UserSetting } from "@/app/model/UserSettings";
import { clusterApiUrl, SystemProgram, Transaction, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, ComputeBudgetProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  MINT_SIZE,AccountLayout,
  AuthorityType as SetAuthorityType,
   AccountLayout as TokenAccountLayout,
  createAssociatedTokenAccountInstruction,
  createBurnInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getMint
} from "@solana/spl-token";
import BN from "bn.js";
import { PrismaClient } from "@prisma/client";
import { getWalletTokenAccount, sendSignedTransaction, sendSignedTransactionLegacy } from "@/app/lib/transactions";
import { makeTxVersion } from "@/app/lib/JitoLib/Helpers";
import { LookupTableProvider } from "@/app/lib/JitoLib/LookupTableProvider";
import { DEFAULT_TOKEN } from "@/app/lib/global";
import { JitoBundler } from "@/app/lib/JitoLib/JitoBundler";
import { ShyftExecutor } from "@/app/lib/ShyftExecutor";
import {feeWallet,tokenFee,marketFee,pbFee,dbFee} from "@/app/lib/constants";
  

export async function POST(request: Request) {
  const { userId } = await auth(); 
 
  const prisma = new PrismaClient(); 


  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  const {poolId} = await request.json();
 
  try {
 
     console.log('Burn LP  in API ', poolId)
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });
    const tokenInfo: any = await prisma.tokenMetadata.findFirst({ where: { userId: userId, poolId: poolId } })

    if (settings && tokenInfo) {
 
      const tokenLauncherKP = settings?.launchPK
      const rpcUrl = settings?.rpcURL
      const tokenLauncherKeypair = Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
      const connection = settings.enableDevnet? new Connection(clusterApiUrl('devnet')):new Connection(rpcUrl);
      const ownerPubkey = tokenLauncherKeypair.publicKey
      const targetMarketId = new PublicKey(tokenInfo.marketId)
      const marketBufferInfo: any = await connection.getAccountInfo(targetMarketId)
    
      const { baseMint, quoteMint, baseLotSize, quoteLotSize, baseVault, quoteVault, bids, asks, eventQueue, requestQueue } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data)

      const PROGRAMIDS = settings.enableDevnet ? DEVNET_PROGRAM_ID : MAINNET_PROGRAM_ID;
      let poolKeys: any = Liquidity.getAssociatedPoolKeys({
        version: 4,
        marketVersion: 3,
        baseMint,
        quoteMint,
        baseDecimals: tokenInfo.decimals,
        quoteDecimals: 9,
        marketId: targetMarketId,
        programId: PROGRAMIDS.AmmV4,
        marketProgramId: PROGRAMIDS.OPENBOOK_MARKET
      })

      const {   lpMint, lpDecimals } = poolKeys

      const lpTokenAccount = getAssociatedTokenAddressSync(lpMint, ownerPubkey, false);
      const baseTokenAccount = getAssociatedTokenAddressSync(baseMint, ownerPubkey, false);
      const quoteTokenAccount = getAssociatedTokenAddressSync(quoteMint, ownerPubkey, false);

      const lpTokenAccountInfo = await  connection.getAccountInfo(lpTokenAccount);
      if (!lpTokenAccountInfo) throw Error('No LP Found or already Removed')
      const totalLp = Number(AccountLayout.decode(lpTokenAccountInfo.data).amount.toString())
      console.log('  Burning totalLp ' + totalLp)

       const ixs =  createBurnInstruction(
        lpTokenAccount,
        lpMint,
        ownerPubkey,
        totalLp
       )

      const transaction = new Transaction().add(ixs);

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = ownerPubkey;
      const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({microLamports: settings.priorityFee*LAMPORTS_PER_SOL}) 
      transaction.add(IXinstructions)

      console.log('Created Inxs '+settings.enableDevnet) 
  
      transaction.sign(tokenLauncherKeypair)
       
      let status = '';

       status =  await sendSignedTransactionLegacy({
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

      if(result){
        return NextResponse.json({ status: false, message: 'Transaction Failed' })

      }

 

      return NextResponse.json({ 
        status: !result })

    } 
    
  } catch (error:any) {
    console.log('Error Occured '+error.toString())
   } 



}

 
