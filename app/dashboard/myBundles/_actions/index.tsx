'use server'
import { auth, clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

 
export async function getMyTokens() {
  const { userId } = await auth();
  const prisma = new PrismaClient();

   console.log('Inside getMyTokens '+ userId)

  if (!userId) {
    return { message: "No Logged In User" }
  }

  try {
    const tokens = await prisma.tokenMetadata.findMany({ where: { userId: userId } });
    return tokens ;
  } catch (error) {
    console.error('Failed to fetch tokenMetadata:', error);
    //throw new Error('Failed to fetch tokenMetadata');
    return [];
  }
}

 
