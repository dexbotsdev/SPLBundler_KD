import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { ComputeBudgetInstruction, ComputeBudgetProgram, Connection, GetProgramAccountsFilter, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { TransactionWithSigners } from "./global";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
const {
    searcher: { searcherClient },
} = require("jito-ts");
import { 
  SPL_ACCOUNT_LAYOUT, 
  TokenAccount,
} from '@raydium-io/raydium-sdk';
import { 
  SendOptions,
  Signer, 
} from '@solana/web3.js';


var jitoClients = [];
 

export async function getJitoTipTransaction(connection:Connection, ownerPubkey:PublicKey, tip:number) {
    const TIP_ADDRESSES = [
        '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5', // Jitotip 1
        'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe', // Jitotip 2
        'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY', // Jitotip 3
        'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49', // Jitotip 4
        'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh', // Jitotip 5
        'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt', // Jitotip 6
        'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL', // Jitotip 7
        '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT', // Jitotip 8
    ];
    // const getRandomNumber = (min, max) => {
    //     return Math.floor(Math.random() * (max - min + 1)) + min;
    // };
    console.log("Adding tip transactions...");

    const tipAccount = new PublicKey(TIP_ADDRESSES[0]);
    const instructions = [
        SystemProgram.transfer({
            fromPubkey: ownerPubkey,
            toPubkey: tipAccount,
            lamports: LAMPORTS_PER_SOL * tip,
        })
    ];
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const messageV0 = new TransactionMessage({
        payerKey: ownerPubkey,
        recentBlockhash,
        instructions,
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
}

export const  sendAndConfirmVersionedTransactions = async (connection:Connection, transactions: any[]) => {
    let retries = 50;
    let passed :any= {};
    const rawTransactions = transactions.map(item => item.serialize());
    while (retries > 0) {
        try {
            let signatures:any= {};
            for (let i = 0; i < rawTransactions.length; i++) {
                if (!passed[i]) {
                    signatures[i] = await connection.sendRawTransaction(rawTransactions[i], {
                        skipPreflight: true,
                        maxRetries: 1,
                    });

                    console.log('sending transaction '+signatures[i])


                }
            }

            const sentTime = Date.now();
            while (Date.now() - sentTime <= 1000) {
                for (let i = 0; i < rawTransactions.length; i++) {
                    if (!passed[i]) {
                        const ret = await connection.getParsedTransaction(signatures[i], {
                            commitment: "finalized",
                            maxSupportedTransactionVersion: 0,
                        });
                        if (ret)
                            passed[i] = true;
                    }
                }

                let done = true;
                for (let i = 0; i < rawTransactions.length; i++) {
                    if (!passed[i]) {
                        done = false;
                        break;
                    }
                }

                if (done)
                    return true;

                await sleep(500);
            }
        }
        catch (err) {
            console.log(err);
        }
        retries--;
    }

    return false;
}



export const   sendAndConfirmLegacyTransactions = async (connection: Connection, transactions: { transaction: Transaction; signers: Keypair[] }[]) => {
    let retries = 50;
    let passed :any= {};
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const rawTransactions = transactions.map(({ transaction, signers }) => {
        transaction.recentBlockhash = recentBlockhash;
        if (signers.length > 0)
            transaction.sign(...signers);
        return transaction.serialize();
    });

    while (retries > 0) {
        try {
            let pendings :any= {};
            for (let i = 0; i < rawTransactions.length; i++) {
                if (!passed[i]) {
                    pendings[i] = connection.sendRawTransaction(rawTransactions[i], {
                        skipPreflight: true,
                        maxRetries: 0,
                    });
                }
            }

            let signatures  :any= {};
            for (let i = 0; i < rawTransactions.length; i++) {
                if (!passed[i])
                    signatures[i] = await pendings[i];
            }

            const sentTime = Date.now();
            while (Date.now() - sentTime <= 1000) {
                for (let i = 0; i < rawTransactions.length; i++) {
                    if (!passed[i]) {
                        const ret = await connection.getParsedTransaction(signatures[i], {
                            commitment: "finalized",
                            maxSupportedTransactionVersion: 0,
                        });
                        if (ret) {
                            // console.log("Slot:", ret.slot);
                            // if (ret.transaction) {
                            //     console.log("Signatures:", ret.transaction.signatures);
                            //     console.log("Message:", ret.transaction.message);
                            // }
                            const status :any= await connection.getSignatureStatus(signatures[i]);
                            if (status) {
                                console.log("Context:", status.context, "Value:", status.context.value);
                            }
                            passed[i] = true;
                        }
                    }
                }

                let done = true;
                for (let i = 0; i < rawTransactions.length; i++) {
                    if (!passed[i]) {
                        done = false;
                        break;
                    }
                }

                if (done)
                    return true;

                await sleep(500);
            }
        }
        catch (err) {
            console.log(err);
        }
        retries--;
    }

    return false;
}

export const getJitoClient= ()=>{

    const client = searcherClient(process.env.JITO_MAINNET_URL, undefined);

    return client;

}

export const getUnixTs = () => {
    return new Date().getTime() / 1000;
  };

  export async function sendSignedTransactionLegacy({
    signedTransaction,
    connection,
    successCallback,
    sendingCallback,
    confirmStatus, 
    timeout = 30000,
    skipPreflight = true,
  }: {
    signedTransaction: Transaction;
    connection: Connection;
    successCallback?: (txSig: string) => Promise<void>;
    sendingCallback?: (txSig: string) => Promise<void>;
    confirmStatus: (txSig: string,confirmationStatus:string)=> Promise<any>;
    timeout?: number;
    skipPreflight?: boolean;
  }): Promise<string> {
    const rawTransaction = signedTransaction.serialize();
    const startTime = getUnixTs();
  
  
    const txid: TransactionSignature = await connection.sendRawTransaction(
      rawTransaction,
      {
        skipPreflight,
      }
    );
  
    console.log("Started awaiting confirmation for", txid);
    sendingCallback && sendingCallback(txid);

    let done = false;
    (async () => {
      while (!done && getUnixTs() - startTime < timeout) {
        connection.sendRawTransaction(rawTransaction, {
          skipPreflight: true,
        });
        await sleep(300);
      }
    })();
    try {
      await awaitTransactionSignatureConfirmationLegacy(txid, timeout, connection,confirmStatus);
     } catch (err: any) {
      if (err.timeout) {
        throw new Error("Timed out awaiting confirmation on transaction");
      }
      const simulateResult = await connection.simulateTransaction(
        signedTransaction
      );
      if (simulateResult && simulateResult.value.err) {
        if (simulateResult.value.logs) {
          for (let i = simulateResult.value.logs.length - 1; i >= 0; --i) {
            const line = simulateResult.value.logs[i];
            if (line.startsWith("Program log: ")) {
              throw new Error(
                "Transaction failed: " + line.slice("Program log: ".length)
              );
            }
          }
        }
        throw new Error(JSON.stringify(simulateResult.value.err));
      }
      throw new Error("Transaction failed");
    } finally {
      done = true;
    }
  
    successCallback && successCallback(txid);
  
    console.log("Latency", txid, getUnixTs() - startTime);
    return txid;
  }

  async function awaitTransactionSignatureConfirmationLegacy(
txid: TransactionSignature, timeout: number, connection: Connection, confirmStatus: (txSig: string, confirmationStatus: string) => Promise<any>  ) {
    let done = false;
    const result = await new Promise((resolve, reject) => {
      (async () => {
        setTimeout(() => {
          if (done) {
            return;
          }
          done = true;
          console.log("Timed out for txid", txid);
          reject({ timeout: true });
        }, timeout);
        try {
          connection.onSignature(
            txid,
            (result) => {
              console.log("WS confirmed", txid, result);
              done = true;
              if (result.err) {
                reject(result.err);
              } else {
                resolve(result);
                confirmStatus(txid,'confirmed')
              }
            },
            connection.commitment
          );
          console.log("Set up WS connection", txid);
        } catch (e) {
          done = true;
          console.log("WS error in setup", txid, e);
        }
        while (!done) {
          // eslint-disable-next-line no-loop-func
          (async () => {
            try {
              const signatureStatuses = await connection.getSignatureStatuses([
                txid,
              ]);
              const result = signatureStatuses && signatureStatuses.value[0];
              if (!done) {
                if (!result) {
                  // console.log('REST null result for', txid, result);
                } else if (result.err) {
                  console.log("REST error for", txid, result.confirmationStatus);
                  done = true;
                  confirmStatus(txid,result.confirmationStatus||'Error')
                  reject(result.err);
                } else if (
                  !(
                    result.confirmations ||
                    result.confirmationStatus === "confirmed" ||
                    result.confirmationStatus === "finalized"
                  )
                ) {
                  console.log("REST not confirmed", txid, result.confirmationStatus);
                  confirmStatus(txid,result.confirmationStatus||'Error')
                } else {
                  console.log("REST confirmed", txid, result.confirmationStatus);
                  confirmStatus(txid,result.confirmationStatus||'Confirmed')
                  done = true;
                  resolve(result);
                }
              }
            } catch (e) {
              if (!done) {
                console.log("REST connection error: txid", txid, e);
              }
            }
          })();
          await sleep(300);
        }
 
      })();
    });
    done = true;
    return result;
  }

export async function sendSignedTransaction({
    signedTransaction,
    connection,
    successCallback,
    sendingCallback,
    confirmStatus,
    timeout = 30000,
    skipPreflight = true,
  }: {
    signedTransaction: VersionedTransaction ;
    connection: Connection;
    successCallback: (txSig: string) => Promise<void>;
    sendingCallback: (txSig: string) => Promise<void>;
    confirmStatus: (txSig: string,confirmationStatus:string)=> Promise<any>;
    timeout?: number;
    skipPreflight?: boolean;
  }): Promise<string> {
    const rawTransaction = signedTransaction.serialize();
    const startTime = getUnixTs();
  
  
    const txid: TransactionSignature = await connection.sendRawTransaction(
      rawTransaction,
      {
        skipPreflight,
      }
    );
    sendingCallback && sendingCallback(txid);
  
    console.log("Started awaiting confirmation for", txid);
  
    let done = false;
    (async () => {
      while (!done && getUnixTs() - startTime < timeout) {
        connection.sendRawTransaction(rawTransaction, {
          skipPreflight: true,
        });
        await sleep(1000);
      }
    })();
    try {
      await awaitTransactionSignatureConfirmation(txid, timeout, connection,confirmStatus);
     } catch (err: any) {
      if (err.timeout) {
        throw new Error("Timed out awaiting confirmation on transaction");
      }
      const simulateResult = await connection.simulateTransaction(
        signedTransaction
      );
      if (simulateResult && simulateResult.value.err) {
        if (simulateResult.value.logs) {
          for (let i = simulateResult.value.logs.length - 1; i >= 0; --i) {
            const line = simulateResult.value.logs[i];
            if (line.startsWith("Program log: ")) {
              throw new Error(
                "Transaction failed: " + line.slice("Program log: ".length)
              );
            }
          }
        }
        confirmStatus(txid,'AlreadyProcessed')
       }
      throw new Error("Transaction failed");
    } finally {
      done = true;
    }
  
  
    console.log("Latency", txid, Number(getUnixTs() - startTime).toFixed(0)+'Seconds');
    successCallback && successCallback(txid);
  
    return txid;
  }
  
  async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature, timeout: number, connection: Connection,  
  confirmStatus: (txSig: string,confirmationStatus:any)=> Promise<void>) {
    let done = false;
    const result = await new Promise((resolve, reject) => {
      (async () => {  
        while (!done) {
          // eslint-disable-next-line no-loop-func
          (async () => {
            try {
              const signatureStatuses = await connection.getSignatureStatuses([
                txid,
              ]);
              const result = signatureStatuses && signatureStatuses.value[0];
              if (!done) {
                if (!result) {
                  // console.log('REST null result for', txid, result);
                } else if (result.err) {
                  console.log("REST error for", txid, result.confirmationStatus);
                  done = true;
                  confirmStatus(txid,result.confirmationStatus)
                  reject(result.err);
                } else if (
                  !(
                    result.confirmations ||
                    result.confirmationStatus === "confirmed" ||
                    result.confirmationStatus === "finalized"
                  )
                ) {
                  console.log("REST not confirmed", txid, result.confirmationStatus);
                  confirmStatus(txid,result.confirmationStatus)
                } else {
                  console.log("REST confirmed", txid, result.confirmationStatus);
                  confirmStatus(txid,result.confirmationStatus)
                  done = true;
                  resolve(result);
                }
              }
            } catch (e) {
              if (!done) {
                console.log("REST connection error: txid", txid, e);
              }
            }
          })();
          await sleep(1000);
        }
      })();
    });
    done = true;
    return result;
  }

export const sleep = (ms: number | undefined) => new Promise(r => setTimeout(r, ms));





export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}



export async function getTokenAccountBalance(
  connection: Connection,
  wallet: string,
  mint_token: string
) {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165, //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32, //location of our query in the account (bytes)
        bytes: wallet, //our search criteria, a base58 encoded string
      },
    },
    //Add this search parameter
    {
      memcmp: {
        offset: 0, //number of bytes
        bytes: mint_token, //base58 encoded string
      },
    },
  ];
  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: filters,
  });

  for (const account of accounts) {
    const parsedAccountInfo: any = account.account.data;
    // const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    const tokenBalance: number = parseInt(
      parsedAccountInfo["parsed"]["info"]["tokenAmount"]["amount"]
    );

    // console.log(
    //   `Account: ${account.pubkey.toString()} - Mint: ${mintAddress} - Balance: ${tokenBalance}`
    // );

    if (tokenBalance) {
      return tokenBalance;
    }
  }
}