import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import {
  ENDPOINT as _ENDPOINT
} from '@raydium-io/raydium-sdk';
import { Keypair } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

export async function POST(request: Request) {
  const { userId } = await auth();


  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {

    const body = await request.json();
    const {
      baseTokenMint,
      privateWallets
    } = body;
    const prisma = new PrismaClient();


    console.log(baseTokenMint)
    console.log(privateWallets)
    

    const tokenMetaOld = await prisma.tokenMetadata.findFirst({ where: { tokenAddress: baseTokenMint, userId: userId } })

    if (tokenMetaOld) {

      const pwallets = [];
      const newwallets = [];

 
      for (var i = 0; i < privateWallets.length; i++) {
        if(privateWallets[i].address=='NEW')
            { 
              const keypair = Keypair.fromSecretKey(bs58.decode(privateWallets[i].privateKey))
              pwallets.push({
              tokenAddress: baseTokenMint,
              privateKey: privateWallets[i].privateKey,
              address: keypair.publicKey.toString(),
              snipeAmount: '' + privateWallets[i].snipeAmount,
              userId: userId
            }) 
          }
        } 

      console.log(pwallets);


      if(pwallets.length!=0)
      await prisma.privateWallet.deleteMany({ where: { tokenAddress: baseTokenMint, userId: userId } })


      await prisma.privateWallet.createMany({ data: pwallets })



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
    message: `PoolInfo   Created`
  })

}


function findExists(oldWallets: string | any[], newWallets: string | any[]) {
  let exists = false;
  for (var i = 0; i < newWallets.length; i++) {
    for (var j = 0; j < oldWallets.length; j++) {
      if (oldWallets[j].address == newWallets[i].address) exists = true;
    }
  }
  return exists;
}