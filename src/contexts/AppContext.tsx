import { createContext, useContext } from 'react';
import type { RuntimeBridge } from '../types/domain';

export const AppContext = createContext<RuntimeBridge | null>(null);

export function useAppContext(): RuntimeBridge {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useAppContext must be used inside AppContext.Provider');
  }

  return value;
}
