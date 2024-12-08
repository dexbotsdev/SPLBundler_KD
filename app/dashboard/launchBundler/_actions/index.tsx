'use server'
import { Keypair, PublicKey, VersionedTransaction, TransactionInstruction, TransactionMessage, SystemProgram, clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { auth, clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { TokenMetadata } from '@/app/model/TokenMetadata';
import { UserSetting } from '@/app/model/UserSettings';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { DEVNET_PROGRAM_ID, Liquidity, MAINNET_PROGRAM_ID, MARKET_STATE_LAYOUT_V3 } from '@raydium-io/raydium-sdk';
import { getMint } from '@solana/spl-token';
import { getTokenAccountBalance } from '@/app/lib/transactions';
import { DEFAULT_TOKEN } from '@/app/lib/global';


export async function getMarketInfoById(tokenAddress: string) {
  const client = await clerkClient()
  const { userId } = await auth();
  const prisma = new PrismaClient();

  console.log('Inside getMyTokens ',tokenAddress)

  if (!userId) {
    return { message: "No Logged In User" }
  }

  try {
    const tokenInfo :any= await prisma.tokenMetadata.findFirst({ where: { userId: userId, tokenAddress: tokenAddress } }) 
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings && tokenInfo) {


      console.log(tokenInfo)

      
      const targetPoolInfo = {
        tokenAddress: tokenInfo.tokenAddress,  
        privateWallets: await getPrivateWallets(tokenInfo.tokenAddress),
        generatedWallets: await getGeneratedWallets(tokenInfo.tokenAddress),
        tokenData: tokenInfo,
        poolData: tokenInfo 
      };

      return targetPoolInfo;
      
    } else {
      
      throw new Error('Failed to fetch Metadata');

    }


  } catch (error) {
    console.error('Failed to fetch Metadata:', error);
    throw new Error('Failed to fetch Metadata');
  }
}

export async function   getPrivateWallets(tokenAddress: string) {
  const { userId } = await auth();
  const prisma = new PrismaClient();

  console.log('Inside getPrivateWallets ',tokenAddress)

  if (!userId) {
    return { message: "No Logged In User" }
  }

  let privateWalletsResults: { address: string; tokenbalance: string; solbalance: string; snipeAmount: string; }[]=[];
  try {
    const privateWallets :any= await prisma.privateWallet.findMany({ where: { userId: userId, tokenAddress: tokenAddress } }) 
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings && privateWallets && privateWallets.length >0) {

      const rpcUrl = settings?.rpcURL
      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);

      console.log(privateWallets)

      for(var i=0;i< privateWallets.length;i++){
        const walletPrivate = new PublicKey(privateWallets[i].address)
        const walbal =  await connection.getBalance(walletPrivate)
        let baseTokenBalance  = await getTokenAccountBalance(connection,privateWallets[i].address,tokenAddress)

        privateWalletsResults.push({
          address : walletPrivate.toBase58(),
          tokenbalance: Number(''+baseTokenBalance).toFixed(2),
          solbalance: Number(''+walbal).toFixed(4) ,
          snipeAmount: Number(''+privateWallets[i].snipeAmount).toFixed(4) 
        })

      }
      
      
    } else {
      
      return privateWalletsResults;

    }
    return privateWalletsResults

  } catch (error) {
    console.error('Failed to fetch privateWalletsResults:', error);
    throw new Error('Failed to fetch privateWalletsResults');
  }
}

export async function getGeneratedWallets(tokenAddress: string) {
  const { userId } = await auth();
  const prisma = new PrismaClient();

  console.log('Inside getGeneratedWallets ',tokenAddress)

  if (!userId) {
    return { message: "No Logged In User" }
  }

  let generatedWalletsResults: { address: string; tokenbalance: string; solbalance: string; snipeAmount: string; }[]=[];
  try {
    const generatedWallets :any= await prisma.generatedWallet.findMany({ where: { userId: userId, tokenAddress: tokenAddress } }) 
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings && generatedWallets && generatedWallets.length >0) {

      const rpcUrl = settings?.rpcURL
      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
 
      
      for(var i=0;i< generatedWallets.length;i++){
        const walletPrivate = new PublicKey(generatedWallets[i].address)
        const walbal =  await connection.getBalance(walletPrivate)
        let baseTokenBalance  = await getTokenAccountBalance(connection,generatedWallets[i].address,tokenAddress)

        generatedWalletsResults.push({
          address : walletPrivate.toBase58(),
          tokenbalance: Number(''+baseTokenBalance).toFixed(2),
          solbalance: Number(''+walbal).toFixed(4) ,
          snipeAmount: Number(''+generatedWallets[i].snipeAmount).toFixed(4) 
        })

      }
      
      
      
    } else {
      
      //throw new Error('Failed to fetch generatedWalletsResults');

      return generatedWalletsResults;

    }
    return generatedWalletsResults

  } catch (error) {
    console.error('Failed to fetch generatedWalletsResults:', error);
    throw new Error('Failed to fetch generatedWalletsResults');
  }
}

export async function getPoolInfo(tokenAddress: string) {
  const { userId } = await auth();
  const prisma = new PrismaClient();

  console.log('Inside getPoolInfo ')

  if (!userId) {
    return { message: "No Logged In User" }
  }

   let poolInfo :any={}
   try {
    const tokenInfo :any= await prisma.tokenMetadata.findFirst({ where: { userId: userId, tokenAddress: tokenAddress } }) 
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings && tokenInfo && tokenInfo.poolId) {

      const rpcUrl = settings?.rpcURL
      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);

      poolInfo ={
        lpMint :'',
        lpBalance : 0
      }
      
    } else {
      
      throw new Error('Failed to fetch getPoolInfo');

    }
 
  } catch (error) {
    console.error('Failed to fetch getPoolInfo:', error);
    throw new Error('Failed to fetch getPoolInfo');
  }
}


export async function getPrePoolinfo(tokenAddress: string) {
   const { userId } = await auth();
  const prisma = new PrismaClient();

  console.log('Inside getMyTokens ')

  if (!userId) {
    return { message: "No Logged In User" }
  }

  try {
    const tokenInfo :any= await prisma.tokenMetadata.findFirst({ where: { userId: userId, tokenAddress: tokenAddress } }) 
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings && tokenInfo) {
      const targetMarketId = new PublicKey(tokenInfo.marketId)
      const programID = settings.enableDevnet ? DEVNET_PROGRAM_ID : MAINNET_PROGRAM_ID;


      const tokenLauncherKP = settings?.launchPK
      const rpcUrl = settings?.rpcURL
      const tokenLauncherKeypair :any= Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
      const wallet = new NodeWallet(tokenLauncherKeypair)

      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
      const ownerPubkey = tokenLauncherKeypair.publicKey
      
      let quoteTokenSymbol = tokenInfo.quoteName
       
      let quoteTokenBalance =  ((await connection.getBalance(ownerPubkey))/LAMPORTS_PER_SOL).toFixed(4)
      let baseTokenBalance = await getTokenAccountBalance(connection,wallet.publicKey.toBase58(),tokenAddress)
      const targetPoolInfo = {
        baseMint: tokenAddress, 
        startTime: Date.now(),
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