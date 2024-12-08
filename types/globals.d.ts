export {} 


export interface ImportMetaEnv {
  readonly PINATA_JWT: string;
  readonly GATEWAY_URL: string; 
 
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'bn.js'

declare global { 
    interface CustomJwtSessionClaims {
      metadata: {
        onboardingComplete?: boolean;
        launchPK?: string;
      };
      firstName?: string;
    }
  }
