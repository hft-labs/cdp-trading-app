"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import Loading from "@/components/loading";
import SignInScreen from "@/components/sign-in-screen";

export default function ClientApp({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  return (
    <div className="app h-full flex-grow">
      {!isInitialized && <Loading />}
      {isInitialized && (
        <>
          {!isSignedIn && <SignInScreen />}
          {isSignedIn && (
              <>{children}</>
          )}
        </>
      )}
    </div>
  );
}