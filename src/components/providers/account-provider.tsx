"use client";
import { createContext, useContext } from "react";

type AccountContextType = {
  accountAddress?: string;
};

export const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccountContext must be used within an AccountProvider");
  }
  return context;
};

type AccountProviderProps = {
  children: React.ReactNode;
  accountAddress?: string;
};

export function AccountProvider({ children, accountAddress }: AccountProviderProps) {
  return (
    <AccountContext.Provider value={{ accountAddress }}>
      {children}
    </AccountContext.Provider>
  );
}
