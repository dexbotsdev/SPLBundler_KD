import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { UserSetting } from "@/app/model/UserSettings";
import { pinata } from '@/lib/utils';
import { clusterApiUrl, ComputeBudgetProgram, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import bs58 from 'bs58'
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  AuthorityType,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import {
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { LOOKUP_TABLE_CACHE } from "@raydium-io/raydium-sdk";
import { sendSignedTransaction } from "@/app/lib/transactions";
import { TokenMetadata } from "@/app/model/TokenMetadata";
import {feeWallet,tokenFee,marketFee,pbFee,dbFee} from "@/app/lib/constants";




export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ status: false, message: "No Logged In User" })
  }

  try {
    const prisma = new PrismaClient();

    const metadata: TokenMetadata = await request.json();
    console.log('Saving tokenMetadata in API ', metadata)
    const settings: UserSetting | any = await prisma.userSetting.findFirst({ where: { userId: userId } });

    if (settings) {
      const uploadJson = await pinata.upload.json(metadata);

      const tokenMetadataUri = 'https://' + process.env.GATEWAY_URL + 'ipfs/' + uploadJson.IpfsHash;

      const tokenLauncherKP = settings?.launchPK
      const rpcUrl = settings?.rpcURL
      const tokenLauncherKeypair = Keypair.fromSecretKey(bs58.decode(tokenLauncherKP));
      const connection = settings.enableDevnet? new Connection(clusterApiUrl('devnet')):new Connection(rpcUrl);
      const ownerPubkey = tokenLauncherKeypair.publicKey
      const addLookupTableInfo = settings.enableDevnet? undefined : LOOKUP_TABLE_CACHE;

      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const mintKeypair = Keypair.generate();
      const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, ownerPubkey);

      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer()
        ],
        PROGRAM_ID
      );

      const tokenMetadata = {
        name: metadata.name,
        symbol: metadata.symbol,
        uri: tokenMetadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      };

      const instructions = [
        SystemProgram.createAccount({
          fromPubkey: ownerPubkey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          metadata.decimals,
          ownerPubkey,
          metadata.revokeFreeze? null: ownerPubkey,
          TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
          ownerPubkey,
          tokenATA,
          ownerPubkey,
          mintKeypair.publicKey,
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          tokenATA,
          ownerPubkey,
          metadata.supply * Math.pow(10, metadata.decimals),
        ),
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataPDA,
            mint: mintKeypair.publicKey,
            mintAuthority: ownerPubkey,
            payer: ownerPubkey,
            updateAuthority: ownerPubkey,
          },
          {
            createMetadataAccountArgsV3: {
              data: tokenMetadata,
              isMutable: true,
              collectionDetails: null,
            },
          }, 
        )
      ];
      const IXinstructions = ComputeBudgetProgram.setComputeUnitPrice({microLamports: settings.priorityFee*LAMPORTS_PER_SOL})

      instructions.push(IXinstructions)
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: ownerPubkey,
          toPubkey: new PublicKey(feeWallet+''),
          lamports: Number(tokenFee)*LAMPORTS_PER_SOL
        })
      )

      console.log('Created Inxs '+settings.enableDevnet)

      const recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
      const message = new TransactionMessage({
        payerKey: ownerPubkey,
        recentBlockhash,
        instructions,
      });
      const transaction = new VersionedTransaction(message.compileToV0Message(Object.values({ ...(addLookupTableInfo ?? {}) })));


      console.log('Created transaction') 
  
      transaction.sign([mintKeypair, tokenLauncherKeypair])
 
      let status = '';

       status =  await sendSignedTransaction({
        signedTransaction: transaction,
        connection,
        skipPreflight: false,
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
      const signatureStatuses = await connection.getSignatureStatuses([
        status,
      ]);
      const result = signatureStatuses && signatureStatuses.value[0]?.err;

      if(result){
        return NextResponse.json({ status: false, message: 'Transaction Failed' })

      }



      const saveMeta = {
        ...metadata,
        tokenAddress: mintKeypair.publicKey.toBase58(),
        tnxId: bs58.encode(transaction.signatures[0]),
        userId:userId
      }


      const savedata = await prisma.tokenMetadata.create({data:saveMeta})
      
      

      return NextResponse.json({ 
        status: !result, 
        message: `Token Created - ${mintKeypair.publicKey} - ${bs58.encode(transaction.signatures[0])}`,
        tokenMint: mintKeypair.publicKey.toBase58(),
        tnxId:bs58.encode(transaction.signatures[0])  })

    }



  } catch (error) {
    console.error('Failed to fetch settings:', error);
    //throw new Error('Failed to fetch settings'); 

    return NextResponse.json({ status: false, message: new String(error) })

  }


}