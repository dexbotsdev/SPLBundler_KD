import { Connection, Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, TransactionInstruction, ComputeBudgetProgram, SendTransactionError } from '@solana/web3.js';
import bs58 from 'bs58';
import { Network, ShyftSdk } from '@shyft-to/js';
import { createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createSyncNativeInstruction, getAccount, getAssociatedTokenAddress, getMint, MINT_SIZE, MintLayout, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { jsonInfo2PoolKeys, Liquidity, LiquidityPoolKeys, LiquidityPoolKeysV4, Token, TokenAmount } from '@raydium-io/raydium-sdk';
import getTokenAccount from '@/app/lib/get-token-account'

import getTokenBalance from '@/app/lib/get-token-balance'
import { BN } from '@project-serum/anchor';



export const performRaydiumSell = async(connection: Connection,  mainWallet: Keypair, inputTokenMint: PublicKey, poolKeys: LiquidityPoolKeysV4, percentage:number)=>
{
    let cnt = 0;
    let failureCount = 0;
    const finalInst: TransactionInstruction[] = [];

    const baseAccount = await getAssociatedTokenAddress(inputTokenMint, mainWallet.publicKey);
    const wsolAccount = await getAssociatedTokenAddress(NATIVE_MINT, mainWallet.publicKey);

    const tokenAccount = await getTokenAccount(connection, mainWallet.publicKey.toBase58(), inputTokenMint.toBase58())
    let tokenbalance = 0
    if (tokenAccount) {

        tokenbalance = await getTokenBalance(connection, tokenAccount);
    }

    const createAtaInstructionQ = createAssociatedTokenAccountInstruction(
        mainWallet.publicKey,
        wsolAccount,
        mainWallet.publicKey,
        poolKeys.quoteMint
    );

    if (tokenbalance > 0) {

        const insSell = Liquidity.makeSwapInstruction({
            poolKeys: poolKeys,
            userKeys: {
                tokenAccountIn: baseAccount,
                tokenAccountOut: wsolAccount,
                owner: mainWallet.publicKey,
            },
            amountIn:Number((tokenbalance*percentage/100).toFixed(0)),
            amountOut: new BN(1),
            fixedSide: 'in',
        });

        const blockhash = (await connection.getLatestBlockhash('finalized')).blockhash
        console.log('Fetch New Blockhash for TNX ' + blockhash)
        finalInst.push(createAtaInstructionQ)
        console.log('  Preparing Trade Instructions ')

        for (var ix of insSell.innerTransaction.instructions) {
            finalInst.push(ix);
        }


        const closeQuoteAccount = createCloseAccountInstruction(wsolAccount,
            mainWallet.publicKey,
            mainWallet.publicKey
        )



        finalInst.push(closeQuoteAccount); 

        
    }

    return finalInst;
}

 