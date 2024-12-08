import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
 import {
  ENDPOINT as _ENDPOINT} from '@raydium-io/raydium-sdk';





export async function POST(request: Request) {
  const { userId } = await auth();

   
  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'openBookMarketId',
      'ammId',
      'baseTokenMint',
      'quoteTokenMint',
      'startTime',
    ];
    for (const field of requiredFields) {

      console.log(field+":"+body[field]);

      if (!body[field]) {
        return new Response(JSON.stringify({ message: `${field} is required` }), {
          status: 400,
        });
      }
    }
    const prisma = new PrismaClient();

    const data= {
      marketId: body.openBookMarketId,  
      startTime: new Date(body.startTime).getTime(), 
      baseTokenInitialLiquidity: parseFloat(body.baseTokenInitialLiquidity),
      quoteTokenInitialLiquidity: parseFloat(body.quoteTokenInitialLiquidity), 
    }


    const tokenMetaOld = await prisma.tokenMetadata.findFirst({ where: { tokenAddress: body.baseTokenMint, userId: userId } })

    if(tokenMetaOld){ 
      const result = await prisma.tokenMetadata.update({where :{id: tokenMetaOld.id}, data: data})
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