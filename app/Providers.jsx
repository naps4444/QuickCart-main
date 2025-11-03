'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { AppContextProvider } from '@/context/AppContext';

export default function Providers({ children }) {
  return (
    <ClerkProvider>
      <Toaster />
      <AppContextProvider>
        {children}
      </AppContextProvider>
    </ClerkProvider>
  );
}
