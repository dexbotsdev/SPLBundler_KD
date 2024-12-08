
export type TransactionError = {
    Ok: null;
};
export type Context = {
    slot: number;
};

export type JitoBundleStatusResponse = {
    jsonrpc: string;
    result: JitoBundleStatusResult;
    id: number;
};

export type JitoBundleStatusResult = {
    context: Context;
    value: JitoBundleStatus[];
};

export type JitoBundleStatus = {
    bundle_id: string;
    transactions: string[];
    slot: number;
    confirmation_status: "finalized" | "processed" | "confirmed";
    err: TransactionError;
};