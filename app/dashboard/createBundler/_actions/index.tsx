'use server'
import { Keypair, PublicKey, VersionedTransaction, TransactionInstruction, TransactionMessage, SystemProgram, clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { auth, clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { UserSetting } from '@/app/model/UserSettings';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { DEVNET_PROGRAM_ID, Liquidity, MAINNET_PROGRAM_ID, MARKET_STATE_LAYOUT_V3 } from '@raydium-io/raydium-sdk';
import { getMint } from '@solana/spl-token';
import { getTokenAccountBalance } from '@/app/lib/transactions';
import { DEFAULT_TOKEN } from '@/app/lib/global';


export async function getMarketInfoById(marketId: string) {
  const client = await clerkClient()
  const { userId } = await auth();
  const prisma = new PrismaClient();

  console.log('Inside getMyTokens ')

  if (!userId) {
    return { message: "No Logged In User" }
  }

  try {
    const tokenInfo :any= await prisma.tokenMetadata.findFirst({ where: { userId: userId, marketId: marketId } }) 
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings && tokenInfo) {
      const targetMarketId = new PublicKey(tokenInfo.marketId)
      const programID = settings.enableDevnet ? DEVNET_PROGRAM_ID : MAINNET_PROGRAM_ID;


      const tokenLauncherKP = settings?.launchPK
      const rpcUrl = settings?.rpcURL
      const tokenLauncherKeypair = Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
 
      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
      const ownerPubkey = tokenLauncherKeypair.publicKey

      const marketBufferInfo: any = await connection.getAccountInfo(targetMarketId)
      const { baseMint, quoteMint, baseLotSize, quoteLotSize, baseVault, quoteVault, bids, asks, eventQueue, requestQueue } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data)
 
       const tokenInfoQ = await getMint(connection, quoteMint)
  
      const associatedPoolKeys = await Liquidity.getAssociatedPoolKeys({
        version: 4,
        marketVersion: 3,
        baseMint,
        quoteMint,
        baseDecimals: tokenInfo.decimals,
        quoteDecimals:tokenInfoQ.decimals,
        marketId: targetMarketId,
        programId: programID.AmmV4,
        marketProgramId: programID.OPENBOOK_MARKET,
      });
      const { id: ammId, lpMint } = associatedPoolKeys;
      console.log("AMM ID: ", ammId.toString());
      let quoteTokenSymbol = 'SOL'
      if(quoteMint.toBase58() == DEFAULT_TOKEN.USDC.mint.toBase58()){
quoteTokenSymbol = 'USDC'
      }
      if(quoteMint.toBase58() == DEFAULT_TOKEN.USDT.mint.toBase58()){
        quoteTokenSymbol = 'USDT'
              }

      let quoteTokenBalance =  ((await connection.getBalance(ownerPubkey))/LAMPORTS_PER_SOL).toFixed(4)
      let baseTokenBalance = await getTokenAccountBalance(connection,ownerPubkey.toBase58(),baseMint.toBase58())
      const targetPoolInfo = {
        ammId: ammId.toString(),  
        baseMint: associatedPoolKeys.baseMint.toString(),
        quoteMint: associatedPoolKeys.quoteMint.toString(),
        marketId: associatedPoolKeys.marketId.toString(),
        startTime: "29/11/2024 14:22 UTC",
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenSymbol: tokenInfo.symbol,
        quoteTokenSymbol: quoteTokenSymbol
      };

      return targetPoolInfo;
      
    } else {
      
      throw new Error('Failed to fetch Meetadata');

    }


  } catch (error) {
    console.error('Failed to fetch Meetadata:', error);
    throw new Error('Failed to fetch Meetadata');
  }
}


