import { Icons } from '@/components/Icons';
import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Mongoose } from 'mongoose';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface TokenData {
  tokenAddress: string
  supply: string
  image: string
  name: string
  totalSupply: string
  quoteName: string
  symbol: string
  poolId: string | null
}

export interface LaunchData {
  tokenAddress: string; 
  primaryBundlerEnabled: boolean;
  delayEnabled: boolean;
  delaySeconds: number;
  baseLiquidity: number;
  quoteLiquidity: number;
  startTime: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;
 


declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
  var prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
}


