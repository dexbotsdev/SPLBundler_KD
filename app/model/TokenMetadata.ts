import { prop, getModelForClass } from "@typegoose/typegoose";

  class TokenMetadata {
  @prop({ required: false })
  marketId?: string;

  @prop({ required: false })
  poolId?: string;

  @prop({ required: false })
  date?: number;

  @prop({ required: false })
  tokenAddress?: string;

  @prop({ required: false })
  quoteAddress?: string;

  @prop({ required: false })
  quoteName?: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  symbol!: string;

  @prop({ required: true })
  decimals!: number;

  @prop({ required: true })
  supply!: number;

  @prop({ required: false, default: null })
  image?: string | null;

  @prop({ required: false, default: null })
  imageHash?: string | null;

  @prop({ required: false, default: null })
  metaHash?: string | null;

  @prop({ required: true })
  description!: string;

  @prop({ required: false })
  website?: string;

  @prop({ required: false })
  twitter?: string;

  @prop({ required: false })
  telegram?: string;

  @prop({ required: false })
  discord?: string;

  @prop({ required: true, default: false })
  revokeUpdate!: boolean;

  @prop({ required: true, default: false })
  revokeFreeze!: boolean;

  @prop({ required: true, default: false })
  revokeMint!: boolean;

  @prop({ required: false })
  tnxId?: string;

  @prop({ required: false })
  creators?: string[];

  @prop({ required: true })
  userId?: string; 


  @prop({ required: true })
  baseTokenInitialLiquidity!: number; 

  @prop({ required: true })
  quoteTokenInitialLiquidity!: number; 

  @prop({ required: true })
  startTime!: number;

}

  const TokenMetadataModel = getModelForClass(TokenMetadata);

export { TokenMetadata, TokenMetadataModel };
