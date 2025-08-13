"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import Loading from "@/components/loading";
import SignInScreen from "@/components/sign-in-screen";
import { AccountActivationGuard } from "@/components/account-activation-guard";

export default function ClientApp({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  return (
    <div className="app flex-col-container flex-grow">
      {!isInitialized && <Loading />}
      {isInitialized && (
        <>
          {!isSignedIn && <SignInScreen />}
          {isSignedIn && (
            <AccountActivationGuard>
              {children}
            </AccountActivationGuard>
          )}
        </>
      )}
    </div>
  );
}