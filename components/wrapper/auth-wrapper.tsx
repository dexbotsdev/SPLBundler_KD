import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import config from '@/config';

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  if (!config.auth.enabled) {
    return <>{children}</>;
  }

  return <ClerkProvider dynamic afterSignOutUrl="/">{children}</ClerkProvider>;
};

export default AuthWrapper;