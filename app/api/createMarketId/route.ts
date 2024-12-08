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
import { sendSignedTransactionLegacy,  } from "@/app/lib/transactions";
import {signTransactions} from '@/app/lib/util'
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

  let baseMint: PublicKey;
  let baseMintDecimals: number;
  let quoteMint: PublicKey;
  let quoteMintDecimals: number;
  const vaultInstructions: TransactionInstruction[] = [];
  const vaultSigners: Keypair[] = [];
  const marketInstructions: TransactionInstruction[] = [];
  const marketSigners: Keypair[] = [];

  const totalEventQueueSize = 11308
  const totalRequestQueueSize = 844
  const totalOrderbookSize = 14524
  const TRANSACTION_MESSAGES = [
    {
      sendingMessage: "Creating mints.",
      successMessage: "Created mints successfully.",
    },
    {
      sendingMessage: "Creating vaults.",
      successMessage: "Created vaults successfully.",
    },
    {
      sendingMessage: "Creating market.",
      successMessage: "Created market successfully.",
    },
  ];
  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {
    const prisma = new PrismaClient();

    const {
      baseMint,
      quoteMint,
      minOrderSize,
      tickSize,
    } = await request.json();
    console.log('CreateMarketID  in API ', baseMint)
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings && baseMint) {

      const programID = settings.enableDevnet ? DEVNET_PROGRAM_ID.OPENBOOK_MARKET : MAINNET_PROGRAM_ID.OPENBOOK_MARKET;


        const tokenLauncherKP = settings?.launchPK
        const rpcUrl = settings?.rpcURL
        const tokenLauncherKeypair :any= Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
        const wallet = new NodeWallet(tokenLauncherKeypair)

      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);
      const ownerPubkey = tokenLauncherKeypair.publicKey

      const mint = new PublicKey(baseMint);

      const tokenInfo = await getMint(connection, mint)

      baseMintDecimals = tokenInfo.decimals;
      let pairMint = DEFAULT_TOKEN.SOL.mint
      quoteMintDecimals = DEFAULT_TOKEN.SOL.decimals;


      if (quoteMint == 'sol') {
        pairMint = DEFAULT_TOKEN.SOL.mint
        quoteMintDecimals = DEFAULT_TOKEN.SOL.decimals;

      } else if (quoteMint == 'usdc') {
        pairMint = DEFAULT_TOKEN.USDC.mint
        quoteMintDecimals = DEFAULT_TOKEN.USDC.decimals;

      } else if (quoteMint == 'usdt') {
        pairMint = DEFAULT_TOKEN.USDT.mint
        quoteMintDecimals = DEFAULT_TOKEN.USDT.decimals;

      }

      const marketAccounts = {
        market: Keypair.generate(),
        requestQueue: Keypair.generate(),
        eventQueue: Keypair.generate(),
        bids: Keypair.generate(),
        asks: Keypair.generate(),
        baseVault: Keypair.generate(),
        quoteVault: Keypair.generate(),
      };

      const [vaultOwner, vaultOwnerNonce] = await getVaultOwnerAndNonce(
        marketAccounts.market.publicKey,
        programID
      );
      // create vaults
      vaultInstructions.push(
        ...[
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: marketAccounts.baseVault.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
              ACCOUNT_SIZE
            ),
            space: ACCOUNT_SIZE,
            programId: TOKEN_PROGRAM_ID,
          }),
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: marketAccounts.quoteVault.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
              ACCOUNT_SIZE
            ),
            space: ACCOUNT_SIZE,
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeAccountInstruction(
            marketAccounts.baseVault.publicKey,
            mint,
            vaultOwner
          ),
          createInitializeAccountInstruction(
            marketAccounts.quoteVault.publicKey,
            pairMint,
            vaultOwner
          ),
        ]
      );

      vaultSigners.push(marketAccounts.baseVault, marketAccounts.quoteVault);

      // tickSize and lotSize here are the 1e^(-x) values, so no check for ><= 0
      const baseLotSize = Math.round(
        10 ** baseMintDecimals * Math.pow(10, -1 * baseMintDecimals)
      );
      const quoteLotSize = Math.round(
        10 ** quoteMintDecimals *
        Math.pow(10, -1 * baseMintDecimals) *
        Math.pow(10, -1 * -2)
      );


      // create market account
      marketInstructions.push(
        SystemProgram.createAccount({
          newAccountPubkey: marketAccounts.market.publicKey,
          fromPubkey: ownerPubkey,
          space: Market.getLayout(programID).span,
          lamports: await connection.getMinimumBalanceForRentExemption(
            Market.getLayout(programID).span
          ),
          programId: programID,
        })
      );

      // create request queue
      marketInstructions.push(
        SystemProgram.createAccount({
          newAccountPubkey: marketAccounts.requestQueue.publicKey,
          fromPubkey: ownerPubkey,
          space: totalRequestQueueSize,
          lamports: await connection.getMinimumBalanceForRentExemption(
            totalRequestQueueSize
          ),
          programId: programID,
        })
      );

      // create event queue
      marketInstructions.push(
        SystemProgram.createAccount({
          newAccountPubkey: marketAccounts.eventQueue.publicKey,
          fromPubkey: ownerPubkey,
          space: totalEventQueueSize,
          lamports: await connection.getMinimumBalanceForRentExemption(
            totalEventQueueSize
          ),
          programId: programID,
        })
      );

      const orderBookRentExempt = await connection.getMinimumBalanceForRentExemption(totalOrderbookSize);

      // create bids
      marketInstructions.push(
        SystemProgram.createAccount({
          newAccountPubkey: marketAccounts.bids.publicKey,
          fromPubkey: ownerPubkey,
          space: totalOrderbookSize,
          lamports: orderBookRentExempt,
          programId: programID,
        })
      );

      // create asks
      marketInstructions.push(
        SystemProgram.createAccount({
          newAccountPubkey: marketAccounts.asks.publicKey,
          fromPubkey: ownerPubkey,
          space: totalOrderbookSize,
          lamports: orderBookRentExempt,
          programId: programID,
        })
      );

      marketSigners.push(
        marketAccounts.market,
        marketAccounts.requestQueue,
        marketAccounts.eventQueue,
        marketAccounts.bids,
        marketAccounts.asks
      );


      marketInstructions.push(
        DexInstructions.initializeMarket({
          market: marketAccounts.market.publicKey,
          requestQueue: marketAccounts.requestQueue.publicKey,
          eventQueue: marketAccounts.eventQueue.publicKey,
          bids: marketAccounts.bids.publicKey,
          asks: marketAccounts.asks.publicKey,
          baseVault: marketAccounts.baseVault.publicKey,
          quoteVault: marketAccounts.quoteVault.publicKey,
          baseMint:mint,
          quoteMint:pairMint,
          baseLotSize: new BN(baseLotSize),
          quoteLotSize: new BN(quoteLotSize),
          feeRateBps: 0, // Unused in v3
          quoteDustThreshold: new BN(1), // Unused in v3
          vaultSignerNonce: vaultOwnerNonce,
          programId: programID,
        })
      );
      const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: settings.priorityFee * LAMPORTS_PER_SOL })


      const transactionWithSigners: TransactionWithSigners[] = [];
      transactionWithSigners.push(
        {
          transaction: new Transaction().add(IXinstructions).add(...vaultInstructions),
          signers: vaultSigners,
        },
        {
          transaction: new Transaction().add(IXinstructions).add(...marketInstructions),
          signers: marketSigners,
        }
      );


      try {

        console.log(`${marketAccounts.market.publicKey.toBase58()}`);

        const signedTransactions :any= await signTransactions({
          transactionsAndSigners: transactionWithSigners,
          wallet,
          connection,
        });
        console.log(signedTransactions);

        let statusA = await sendSignedTransactionLegacy({
          signedTransaction: signedTransactions[0],
          connection,
          skipPreflight: true,
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
        let statusB : any=undefined;
        if (statusA) {
          statusB = await sendSignedTransactionLegacy({
            signedTransaction: signedTransactions[1],
            connection,
            skipPreflight: true,
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
        }

        if (signedTransactions.length > 2) {
          const c = await sendSignedTransactionLegacy({
            signedTransaction: signedTransactions[2],
            connection,
            skipPreflight: true,
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
        }


        const tokenMetaOld = await prisma.tokenMetadata.findFirst({ where: { tokenAddress: baseMint, userId: userId } })

        if (tokenMetaOld && statusB) {


        console.log(`Updating MARKET ID -     ${marketAccounts.market.publicKey.toBase58()}`)
        console.log(`BASE MINT -     ${baseMint}`)
        console.log(`QUOTE MINT -     ${pairMint.toBase58()}`)

          await prisma.tokenMetadata.update({
            where: { id: tokenMetaOld.id, userId: userId },
            data: {
              marketId: marketAccounts.market.publicKey.toBase58(),
              quoteAddress: pairMint.toBase58(),
              quoteName: quoteMint
            }
          })


        } else {
          throw Error('Unable to Execute Transaction, Failed or TimeOut Occured')
        }

      } catch (error) {
        console.log(error)
        return NextResponse.json({ status: false, message: 'Unable to Execute Transaction,'+ JSON.stringify(error)})

      } 

      return NextResponse.json({
        status: true,
        message: `Market Id Created  - ${marketAccounts.market.publicKey.toBase58()}  `,
        tokenMint: baseMint,
        marketId: marketAccounts.market.publicKey.toBase58() 
      })

    }



  } catch (error) {
    console.error('Failed to fetch settings:', error);
    //throw new Error('Failed to fetch settings'); 

    return NextResponse.json({ status: false, message: new String(error) })

  }


}