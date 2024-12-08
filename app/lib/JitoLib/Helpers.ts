import {
    CompiledInstruction,
    PublicKey,
    TransactionInstruction
  } from "@solana/web3.js";
  import {   Signer, Transaction } from "@solana/web3.js"
import {
  ENDPOINT as _ENDPOINT,
  Currency,
  DEVNET_PROGRAM_ID,
  LOOKUP_TABLE_CACHE,
  MAINNET_PROGRAM_ID,
  RAYDIUM_MAINNET,
  Token,
  TOKEN_PROGRAM_ID,
  TxVersion,
} from '@raydium-io/raydium-sdk';
  import bs58 from 'bs58';
  

    
  export const makeTxVersion = TxVersion.LEGACY;  
  
  export const addLookupTableInfo = LOOKUP_TABLE_CACHE  


  export function convertTransactionInstruction(
    instruction: TransactionInstruction,
    accountKeys: PublicKey[]
  ): CompiledInstruction {
    const accountIndices = instruction.keys.map((keyObj) =>
      accountKeys.findIndex((pubkey) => pubkey.equals(keyObj.pubkey))
    );
  
    if (accountIndices.includes(-1)) {
      throw new Error("Account key not found in accountKeys list");
    }
  
    const programIdIndex = accountKeys.findIndex((pubkey) =>
      pubkey.equals(instruction.programId)
    );
  
    if (programIdIndex === -1) {
      throw new Error("Program ID not found in accountKeys list");
    }
  
    return {
      programIdIndex,
      accounts: accountIndices,
      data: bs58.encode(instruction.data)
    };
  }
  
  // Function to convert CompiledInstruction to Instruction
  export function convertCompiledInstruction(
    compiledInstruction: CompiledInstruction,
    programId: PublicKey,
    accountKeys: PublicKey[]
  ): TransactionInstruction {
    const keys = compiledInstruction.accounts.map((index) => ({
      pubkey: accountKeys[index],
      isSigner: index === compiledInstruction.programIdIndex, // You might need to adjust this based on your logic
      isWritable: true // This can be modified based on your requirements
    }));
  
    return new TransactionInstruction({
      keys,
      programId,
      data: Buffer.from(compiledInstruction.data)
    });
  }