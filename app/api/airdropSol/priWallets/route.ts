import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

import { UserSetting } from "@/app/model/UserSettings";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { clusterApiUrl, Keypair, PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, ComputeBudgetProgram } from "@solana/web3.js";


export async function POST(request: Request) {
  const { userId } = await auth();
  let txid='';
  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {

    const body = await request.json();
    const { privateKey, wallets, minAmount, maxAmount } = body

    const prisma = new PrismaClient();

    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });


    if (settings) {
      const rpcUrl = settings?.rpcURL
      const airdropWallet = Keypair.fromSecretKey(bs58.decode(privateKey));

      const connection = settings.enableDevnet ? new Connection(clusterApiUrl('devnet')) : new Connection(rpcUrl);

      const solDropTnx = new Transaction();
      const latestBlockHash = await connection.getLatestBlockhash();
      const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: settings.priorityFee * LAMPORTS_PER_SOL })

      solDropTnx.add(IXinstructions);
      for (var i = 0; i < wallets.length; i++) {

        const toWallet = new PublicKey(wallets[i].address);
        const fromWallet = airdropWallet.publicKey

        console.log({
          fromPubkey: fromWallet,
          toPubkey: toWallet,
          lamports: Number((Math.random() * (Number(maxAmount) - Number(minAmount)) + Number(minAmount)).toFixed(4)) * LAMPORTS_PER_SOL
        })

        solDropTnx.add(

          SystemProgram.transfer({
            fromPubkey: fromWallet,
            toPubkey: toWallet,
            lamports: Number((Math.random() * (Number(maxAmount) - Number(minAmount)) + Number(minAmount)).toFixed(4)) * LAMPORTS_PER_SOL
          })

        );


      }

      solDropTnx.recentBlockhash = latestBlockHash.blockhash
      solDropTnx.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight

      solDropTnx.feePayer = airdropWallet.publicKey
      solDropTnx.sign(airdropWallet);


      // Execute the transaction
      const rawTransaction = solDropTnx.serialize();

       txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false, // Changed to false for better security
        maxRetries: 5,
        preflightCommitment: 'confirmed',

      });



      console.log(txid)

    } else {
      throw Error('Unable to Execute Transaction, Failed or TimeOut Occured')
      
    }

  } catch (error) {
    console.error('Failed to save settings:', error);
    //throw new Error('Failed to fetch settings'); 

    return NextResponse.json({ status: false, message: new String(error) })

  }
  return NextResponse.json({
    status: true,
    message: `Airdropped ${txid}`
  })

}