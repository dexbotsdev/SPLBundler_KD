'use server'

import { revalidatePath } from 'next/cache'
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserSetting } from '@/app/model/UserSettings';
import { PrismaClient } from "@prisma/client";


export async function getSettings() {
  const client = await clerkClient()
  const { userId } = await auth();
  const prisma = new PrismaClient();

  if (!userId) {
    return { message: "No Logged In User" }
  }

  try {
    const settings = await prisma.userSetting.findFirst({ where: { userId: userId } });
    return settings ;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw new Error('Failed to fetch settings');
  }
}

export async function saveSettings(settings: any) {
  const client = await clerkClient()
  const { userId } = await auth();
  const prisma = new PrismaClient();


  console.log('Saving Settings in saveSettings function ', settings)
  if (!userId) {
    return { message: "No Logged In User" }
  }


  const settingsData :any = {
    userId: userId,
    launchPK: settings.launchPK,
    enableDevnet: settings.enableDevnet,
    rpcURL: settings.rpcURL,
    priorityFee:  parseFloat(settings.priorityFee),
    jitoTips: parseFloat(settings.jitoTips), 
    shyftApiKey:  settings.shyftApiKey,
    maxRetries: parseInt(settings.maxRetries?settings.maxRetries:'5'), 
  }

  try {
    const settingsOld = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (!settingsOld) {
      await prisma.userSetting.create({data:settingsData})
    } else {
      await prisma.userSetting.update({
        where: { id: settingsOld.id, userId: userId },
        data: settingsData
      })
    }

    

    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        launchPK: settings.launchPK,
        enableDevnet: settings.enableDevnet,
        rpcURL: settings.rpcURL,
        priorityFee:  parseFloat(settings.priorityFee),
        jitoTips: parseFloat(settings.jitoTips),  
        shyftApiKey:  settings.shyftApiKey,
        maxRetries: parseInt(settings.maxRetries?settings.maxRetries:'5'), 
      }
    });


    return { message: "User metadata Updated" }

  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, message: 'Failed to save settings' };
  }
}

