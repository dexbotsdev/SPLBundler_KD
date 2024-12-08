import NextAuth, { DefaultSession } from 'next-auth';
import { any } from 'zod';

declare module 'next-auth' {
  type UserSession = DefaultSession['user'];
  interface Session {
    user: UserSession;
  }

  interface CredentialsInputs {
    email: string;
    password: string;
  }
}
