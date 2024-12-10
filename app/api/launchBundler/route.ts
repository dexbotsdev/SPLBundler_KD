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
import { getMint } from "@solana/spl-token";
import BN from "bn.js";
import { PrismaClient } from "@prisma/client";
import { getWalletTokenAccount, sendSignedTransaction } from "@/app/lib/transactions";
import { makeTxVersion } from "@/app/lib/JitoLib/Helpers";
import { LookupTableProvider } from "@/app/lib/JitoLib/LookupTableProvider";
import { DEFAULT_TOKEN } from "@/app/lib/global";
import { JitoBundler } from "@/app/lib/JitoLib/JitoBundler";
import { ShyftExecutor, submitBundleWithRetry } from "@/app/lib/ShyftExecutor";
import {feeWallet,tokenFee,marketFee,pbFee,dbFee} from "@/app/lib/constants";



export async function POST(request: Request) {
  const { userId } = await auth();

  let ctr: any = undefined;

  const prisma = new PrismaClient();

  const  getRequiredFundsToLaunch= async (launchInfo: LaunchData, settings: any) =>{
   

    const privateWallets = await prisma.privateWallet.findMany({ where: { tokenAddress: launchInfo.tokenAddress, userId: settings.userId } })

    const generatedWallets = await prisma.generatedWallet.findMany({ where: { tokenAddress: launchInfo.tokenAddress, userId: settings.userId } })

    let amntRequired=0;
    for(var p=0;p<privateWallets.length;p++){
      amntRequired = Number(privateWallets[p].snipeAmount)+0.0020398+ Number(settings.priorityFee)
    }
    for(var p=0;p<generatedWallets.length;p++){
      amntRequired = Number(generatedWallets[p].snipeAmount)+0.0020398 + Number(settings.priorityFee)
    }

    let launchFee = Number(launchInfo.quoteLiquidity)+0.1+ Number(settings.priorityFee)+amntRequired;

    return launchFee*LAMPORTS_PER_SOL
  }




  const createPrivateSwaps = async (prisma: PrismaClient, connection: Connection, wallet: Keypair, tokenInfo: any, poolKeys: any, settings: any) => {


    const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: settings.priorityFee * LAMPORTS_PER_SOL })

    const privateWallets = await prisma.privateWallet.findMany({ where: { tokenAddress: tokenInfo.tokenAddress, userId: settings.userId } })

    const baseToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(tokenInfo.tokenAddress), tokenInfo.decimals);

    const privateSwaps: VersionedTransaction[] = [];

    console.log(privateWallets)

    try {
      if (privateWallets) {

        for (var i = 0; i < privateWallets.length; i++) {



          const pWallet = Keypair.fromSecretKey(bs58.decode(privateWallets[i].privateKey));


          const walletTokenAccounts = await getWalletTokenAccount(connection, pWallet.publicKey);
          const outputTokenAmount = new TokenAmount(baseToken, 1, false);
          const inTokenAmount = new TokenAmount(DEFAULT_TOKEN.SOL, privateWallets[i].snipeAmount, false);

          const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
            connection,
            poolKeys,
            userKeys: {
              tokenAccounts: walletTokenAccounts,
              owner: pWallet.publicKey,
            },
            amountIn: inTokenAmount,
            amountOut: outputTokenAmount,
            fixedSide: 'in',
            makeTxVersion
          });

          const createSwapInstructions: TransactionInstruction[] = [];
          const lookupTableProvider = new LookupTableProvider(connection);

          const addressesSwapMain: PublicKey[] = [];
          createSwapInstructions.forEach((ixn) => {
            ixn.keys.forEach((key) => {
              addressesSwapMain.push(key.pubkey);
            });
          });
          const lookupTablesSwapMain = lookupTableProvider.computeIdealLookupTablesForAddresses(addressesSwapMain);
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

          for (const itemIx of innerTransactions) {
            createSwapInstructions.push(...itemIx.instructions)
          }
          const messageMain = new TransactionMessage({
            payerKey: pWallet.publicKey,
            recentBlockhash: blockhash,
            instructions: createSwapInstructions,
          }).compileToV0Message(lookupTablesSwapMain);

          const txMain = new VersionedTransaction(messageMain);
          txMain.sign([pWallet]);
          privateSwaps.push(txMain)

        }


      }
    } catch (error) {

      log('Error creating Private Wallet Swaps')
    }

    return privateSwaps;
  }



  const createDelayedSwaps = async (prisma: PrismaClient, connection: Connection, wallet: Keypair, tokenInfo: any, poolKeys: any, settings: any) => {

    const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: settings.priorityFee * LAMPORTS_PER_SOL })

    const privateWallets = await prisma.generatedWallet.findMany({ where: { tokenAddress: tokenInfo.tokenAddress , userId: settings.userId} })

    const baseToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(tokenInfo.tokenAddress), tokenInfo.decimals);

    const batchedSwaps: string[][] = [];
    let currentBatch: string[] = [];

    try {
      if (privateWallets) {
        for (let i = 0; i < privateWallets.length; i++) {
          const pWallet = Keypair.fromSecretKey(bs58.decode(privateWallets[i].privateKey));

          const walletTokenAccounts = await getWalletTokenAccount(connection, pWallet.publicKey);
          const outputTokenAmount = new TokenAmount(baseToken, 1, false);
          const inTokenAmount = new TokenAmount(DEFAULT_TOKEN.SOL, privateWallets[i].snipeAmount, false);

          const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
            connection,
            poolKeys,
            userKeys: {
              tokenAccounts: walletTokenAccounts,
              owner: pWallet.publicKey,
            },
            amountIn: inTokenAmount,
            amountOut: outputTokenAmount,
            fixedSide: 'in',
            makeTxVersion
          });

          const createSwapInstructions: TransactionInstruction[] = [];
          const lookupTableProvider = new LookupTableProvider(connection);

          const addressesSwapMain: PublicKey[] = [];
          createSwapInstructions.forEach((ixn) => {
            ixn.keys.forEach((key) => {
              addressesSwapMain.push(key.pubkey);
            });
          });
          const lookupTablesSwapMain = lookupTableProvider.computeIdealLookupTablesForAddresses(addressesSwapMain);
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

          for (const itemIx of innerTransactions) {
            createSwapInstructions.push(...itemIx.instructions)
          }
          const messageMain = new TransactionMessage({
            payerKey: pWallet.publicKey,
            recentBlockhash: blockhash,
            instructions: createSwapInstructions,
          }).compileToV0Message(lookupTablesSwapMain);

          const txMain = new VersionedTransaction(messageMain);
          txMain.sign([pWallet]);

          currentBatch.push(txMain.serialize().toString());

          // If we've reached 49 transactions or it's the last wallet, push the current batch
          if (currentBatch.length === 49 || i === privateWallets.length - 1) {
            batchedSwaps.push(currentBatch);
            currentBatch = [];
          }
        }
      }
    } catch (error) {
      log('Error creating Batched Wallet Swaps')
    }

    return batchedSwaps;
  }
  function wait(sec: number) {
    new Promise(resolve => setTimeout(resolve, sec * 1000));
  }

  function delay2s() {
    new Promise(resolve => setTimeout(resolve, 2000));
  }
  const log = (msg: string) => {
    if (ctr) {
      const chunk = encoder.encode(msg + ' ')
      ctr.enqueue(chunk)
    }
  }


  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  const launchInfo: LaunchData = await request.json()
  const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });
  const encoder = new TextEncoder()
  try {

    if (settings && launchInfo) {
      const tokenInfo: any = await prisma.tokenMetadata.findFirst({ where: { userId: userId, tokenAddress: launchInfo.tokenAddress } })
      const stream = new ReadableStream({
        async start(controller) {
          console.log(launchInfo.tokenAddress);
          ctr = controller;

          const tokenLauncherKP = settings?.launchPK
          const rpcUrl = settings?.rpcURL
          const wallet = Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
          const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
          const feeId = settings.enableDevnet ? new PublicKey("3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR") : new PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5")

          const ownerPubkey = wallet.publicKey

          const balance = await connection.getBalance(ownerPubkey)

          const amntRequired = await getRequiredFundsToLaunch(launchInfo,settings);


          if(balance < amntRequired){
            log('Insufficient Funds to run the Bundler')
            throw Error('Insufficient Funds to run the Bundler')

          }

          log('Initializing Token metadata')
          delay2s();
          const tokenAddress = launchInfo.tokenAddress;
          const mint = new PublicKey(tokenAddress);

          const mintInfo = await getMint(connection, mint);
          const baseToken = new Token(TOKEN_PROGRAM_ID, mint, mintInfo.decimals);
          const quoteToken = new Token(TOKEN_PROGRAM_ID, "So11111111111111111111111111111111111111112", 9, "WSOL", "WSOL");
          const targetMarketId = new PublicKey(tokenInfo.marketId)
          const marketBufferInfo: any = await connection.getAccountInfo(targetMarketId)
          const startTime = new Date(Date.parse(launchInfo.startTime))
          const PROGRAMIDS = settings.enableDevnet ? DEVNET_PROGRAM_ID : MAINNET_PROGRAM_ID;

          const baseMintAmount = Number(launchInfo.baseLiquidity) * 10 ** Number(tokenInfo.decimals)
          const quoteMintAmount = Number(launchInfo.quoteLiquidity) * LAMPORTS_PER_SOL
          const addBaseAmount = new BN('' + baseMintAmount)
          const addQuoteAmount = new BN('' + quoteMintAmount)

          const { baseMint, quoteMint, baseLotSize, quoteLotSize, baseVault, quoteVault, bids, asks, eventQueue, requestQueue } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data)

          log('Fetching Liquidity Pool Config')
          delay2s();

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
          poolKeys.marketBaseVault = baseVault;
          poolKeys.marketQuoteVault = quoteVault;
          poolKeys.marketBids = bids;
          poolKeys.marketAsks = asks;
          poolKeys.marketEventQueue = eventQueue;
          const { id: ammId, lpMint } = poolKeys;

          const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey);

          const initPoolInstructionResponse = await Liquidity.makeCreatePoolV4InstructionV2Simple({
            connection,
            programId: PROGRAMIDS.AmmV4,
            marketInfo: {
              marketId: targetMarketId,
              programId: PROGRAMIDS.OPENBOOK_MARKET,
            },
            baseMintInfo: baseToken,
            quoteMintInfo: quoteToken,
            baseAmount: addBaseAmount,
            quoteAmount: addQuoteAmount,
            startTime: new BN(Math.floor(startTime.getTime())),
            ownerInfo: {
              feePayer: wallet.publicKey,
              wallet: wallet.publicKey,
              tokenAccounts: walletTokenAccounts,
              useSOLBalance: true,
            },
            associatedOnly: false,
            checkCreateATAOwner: true,
            makeTxVersion,
            feeDestinationId: feeId, // only mainnet use this
          })

          log(' Creating Pool Instructions  \n')
          delay2s();

          const createPoolInstructions: TransactionInstruction[] = [];
          for (const itemIx of initPoolInstructionResponse.innerTransactions) {
            createPoolInstructions.push(...itemIx.instructions)
          }

          if(launchInfo.primaryBundlerEnabled){
            createPoolInstructions.push(
              SystemProgram.transfer({
                fromPubkey: ownerPubkey,
                toPubkey: new PublicKey(feeWallet+''),
                lamports: Number(pbFee)*LAMPORTS_PER_SOL
              })
            )
          }

          if(launchInfo.delayEnabled){
            createPoolInstructions.push(
              SystemProgram.transfer({
                fromPubkey: ownerPubkey,
                toPubkey: new PublicKey(feeWallet+''),
                lamports: Number(dbFee)*LAMPORTS_PER_SOL
              })
            )
          }

          const addressesMain: PublicKey[] = [];
          createPoolInstructions.forEach((ixn) => {
            ixn.keys.forEach((key) => {
              addressesMain.push(key.pubkey);
            });
          });


          const lookupTableProvider = new LookupTableProvider(connection);
          const lookupTablesPool = lookupTableProvider.computeIdealLookupTablesForAddresses(addressesMain);
          const insts: TransactionInstruction[] = []
          insts.push(...createPoolInstructions);


          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

          delay2s();

          const messageMain = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: blockhash,
            instructions: insts,
          }).compileToV0Message(lookupTablesPool);

          console.log(messageMain.serialize().length)
          const txMain = new VersionedTransaction(messageMain);
          txMain.sign([wallet])
          let privateSwaps: any[] = [];

          log('primaryBundlerEnabled   '+launchInfo.primaryBundlerEnabled)


          if (launchInfo.primaryBundlerEnabled) {

            log('Creating  Pool swaps - Private Wallets   '+launchInfo.primaryBundlerEnabled)

            privateSwaps = await createPrivateSwaps(prisma, connection, wallet, tokenInfo, poolKeys, settings)

            log(' ' + privateSwaps.length)

          }
          let delayedSwaps: string[][] = []

          if (launchInfo.delayEnabled) {

            log('Creating  Pool swaps - Generated Wallets    ')

            delayedSwaps = await createDelayedSwaps(prisma, connection, wallet, tokenInfo, poolKeys, settings)

            log(' ' + delayedSwaps.length)

          }

          const jitoTipTnx = await createJitoTipTnx(wallet, connection, settings)

          const signedTransactions = [txMain];

          if(launchInfo.primaryBundlerEnabled){
            
          }

          if (launchInfo.primaryBundlerEnabled && privateSwaps.length > 0) {
            signedTransactions.push(...privateSwaps)
          }
          signedTransactions.push(jitoTipTnx)

          const jitoBundler = new JitoBundler()

          const bundleTnx = signedTransactions.map((tnx) => tnx.serialize());

          if (privateSwaps.length >= 1) {
            log('Sending Jito Bundle    ')

            delay2s()
            delay2s()
            delay2s()
            delay2s()

            try {
              const bundleIds = await jitoBundler.sendBundle(bundleTnx);

              if (bundleIds) {

                log('Sending Jito Bundle    ' + bundleIds.toString())

                const statusDetails = await jitoBundler.confirmInflightBundle(log, bundleIds)

                console.log(statusDetails)

                if (statusDetails.transactionStatus != 2) {
                  await prisma.tokenMetadata.update({
                    where:{ id:tokenInfo.id},
                    data: {poolId: ammId}
                  })
                  if (launchInfo.delayEnabled) {
                    log('Initializing Delay of     ' + launchInfo.delaySeconds + '   Seconds')

                    wait(launchInfo.delaySeconds);

                    const shyft = new ShyftExecutor(connection, settings.shyftApiKey, settings.enableDevnet)
                    const bundlePromises = delayedSwaps.map(chunk =>
                      submitBundleWithRetry(shyft, chunk, [], blockhash)
                    );
                    const responses = await Promise.allSettled(bundlePromises);

                  }

                }
              }

            } catch (error) {
              log('Error Occured ')
            }
          } else {
            let status = ''; 
            status = await sendSignedTransaction({
              signedTransaction: txMain,
              connection,
              skipPreflight: false,
              successCallback: async (txSig: string) => {
                log('Sent Trasaction Success : Signature :' + txSig);
              },
              sendingCallback: async (txSig: string) => {
                log('Sent Trasaction awaiting Confirmation ' + txSig);
              },
              confirmStatus: async (txSig: string, confirmStatus: string) => {
                log('Recieved Transaction Confirmation :  '+ confirmStatus); 

                await prisma.tokenMetadata.update({
                  where:{ id:tokenInfo.id},
                  data: {poolId: ammId}
                })
                if (launchInfo.delayEnabled) {
                  log('Initializing Delay of     ' + launchInfo.delaySeconds + '   Seconds')

                  wait(launchInfo.delaySeconds);

                  const shyft = new ShyftExecutor(connection, settings.shyftApiKey, false)
                  const bundlePromises = delayedSwaps.map(chunk =>
                    submitBundleWithRetry(shyft, chunk, [], blockhash)
                  );

                  log('Submitted Delayed Bundle     ')

                  const responses = await Promise.allSettled(bundlePromises);

                  if(responses.length>0){
                    for(var i=0;i<responses.length;i++){
                      log(responses[i].status)
                    }
                  }

                }
              },
            });
             

          }

          controller.close();

        }
      })

      return new NextResponse(stream)


    }
  } catch (error:any) {
    log('Error Occured '+error.toString())
    ctr.close()
   } 



}

async function createJitoTipTnx(wallet: Keypair, connection: Connection, settings: any) {

  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const jitoBundler = new JitoBundler();


  const instr = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: jitoBundler.getRandomTipAccount(),
    lamports: Number(Number(settings.jitoTips) * LAMPORTS_PER_SOL),
  })


  const messageMain = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: recentBlockhash,
    instructions: [instr],
  }).compileToV0Message();

  const tipTx = new VersionedTransaction(messageMain);

  tipTx.sign([wallet])
  return tipTx;

}


