import React, { createContext, useContext } from 'react';
import { useAppStore as useAppStoreHook } from '../hooks/useAppStore';

type AppStoreType = ReturnType<typeof useAppStoreHook>;

const AppStoreContext = createContext<AppStoreType | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const store = useAppStoreHook();
  return (
    <AppStoreContext.Provider value={store}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
