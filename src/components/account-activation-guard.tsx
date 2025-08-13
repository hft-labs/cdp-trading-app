"use client";

import { useEffect } from "react";
import { useAccountActivation } from "@/hooks/use-account-activation";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Loader2, CheckCircle, AlertCircle, Wallet } from "lucide-react";

interface AccountActivationGuardProps {
  children: React.ReactNode;
  showActivationUI?: boolean;
}

export function AccountActivationGuard({ 
  children, 
  showActivationUI = true 
}: AccountActivationGuardProps) {
  const {
    isActivated,
    isChecking,
    checkError,
    activateAccount,
    isActivating,
    activationError,
    needsActivation,
    isReady,
  } = useAccountActivation();

  // Get the required data from CDP hooks
  const { currentUser } = useCurrentUser();
  const { evmAddress } = useEvmAddress();

  // Auto-activate account if needed
  useEffect(() => {
    console.log('🔍 Account activation guard state:', {
      needsActivation,
      isActivating,
      isChecking,
      hasCurrentUser: !!currentUser,
      hasEvmAddress: !!evmAddress,
      isActivated,
      isReady
    });

    if (needsActivation && !isActivating && !isChecking && currentUser && evmAddress) {
      console.log('🔄 Auto-activating account...');
      console.log('👤 Current user:', currentUser?.userId);
      console.log('📍 EVM address:', evmAddress);
      activateAccount();
    }
  }, [needsActivation, isActivating, isChecking, currentUser, evmAddress, activateAccount, isActivated, isReady]);

  // Show loading while checking account status
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <Typography type="p" variant="secondary" className="text-gray-400">
              Checking account status...
            </Typography>
        </div>
      </div>
    );
  }

  // Show error if check failed
  if (checkError) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="p-6 max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <Typography type="h3" variant="primary" className="text-center">
              Account Check Failed
            </Typography>
            <Typography type="p" variant="secondary" className="text-center text-gray-400">
              {checkError.message || 'Failed to check account status'}
            </Typography>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show activation UI if account needs activation and UI is enabled
  if (needsActivation && showActivationUI) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="p-6 max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <Wallet className="h-8 w-8 text-blue-500" />
            <Typography type="h3" variant="primary" className="text-center">
              Activate Your Account
            </Typography>
            <Typography type="p" variant="secondary" className="text-center text-gray-400">
              Your account needs to be activated to use all features. 
              This will also give you some gas to get started!
            </Typography>
            
            {isActivating ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <Typography type="p" variant="success" className="text-blue-500">
                  Activating account...
                </Typography>
              </div>
            ) : (
              <Button 
                onClick={() => activateAccount()} 
                disabled={isActivating}
                className="w-full"
              >
                Activate Account
              </Button>
            )}

            {activationError && (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <Typography type="p" variant="destructive" className="text-sm">
                  {activationError.message}
                </Typography>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Show children if account is ready
  if (isReady) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <Typography type="p" variant="secondary" className="text-gray-400">
          Preparing your account...
        </Typography>
      </div>
    </div>
  );
} 