"use client";

import { RootProviders } from "@/components/providers/root-provider";

export default function Page ({ children } : { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
         <RootProviders>
          {children}
         </RootProviders>
      </div>
    </div>
  );
}