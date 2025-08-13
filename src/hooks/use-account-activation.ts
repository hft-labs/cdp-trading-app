import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useEvmAddress, useGetAccessToken } from "@coinbase/cdp-hooks";

interface AccountActivationResponse {
  success: boolean;
  message: string;
  account?: {
    wallet_address: string;
    user_id: string;
    is_active: boolean;
  };
  user?: {
    user_id: string;
    authentication_methods: string[];
    evm_accounts: string[];
    evm_smart_accounts: string[];
    solana_accounts: string[];
  };
  gasTransfer?: {
    transactionHash?: string;
    error?: string;
    skipped?: boolean;
  };
  endUser?: any;
}

interface AccountActivationError {
  error: string;
  details?: string;
}

export const useAccountActivation = () => {
  const { currentUser } = useCurrentUser();
  const { evmAddress } = useEvmAddress();
  const { getAccessToken } = useGetAccessToken();
  const queryClient = useQueryClient();

  // Check if account is activated
  const { data: accountStatus, isLoading: isChecking, error: checkError } = useQuery({
    queryKey: ['account-activation', evmAddress],
    queryFn: async (): Promise<{ isActivated: boolean; account?: any }> => {
      if (!evmAddress || !currentUser) {
        throw new Error("Address and user required");
      }

      try {
        // Check if account exists using the dedicated account status API
        const response = await fetch(`/api/account-status?address=${evmAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          return { isActivated: data.isActivated };
        } else {
          // If the API fails, assume not activated
          return { isActivated: false };
        }
      } catch (error) {
        // If there's an error, assume not activated
        return { isActivated: false };
      }
    },
    enabled: !!evmAddress && !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Activate account mutation
  const { mutate: activateAccount, isPending: isActivating, error: activationError } = useMutation({
    mutationFn: async (): Promise<AccountActivationResponse> => {
      if (!evmAddress || !currentUser) {
        throw new Error("Address and user required");
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Access token required");
      }

      const response = await fetch('/api/activate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: evmAddress,
          accessToken,
        }),
      });

      if (!response.ok) {
        const errorData: AccountActivationError = await response.json();
        throw new Error(errorData.error || 'Failed to activate account');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch account status
      queryClient.invalidateQueries({ queryKey: ['account-activation'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      console.log('✅ Account activated successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Failed to activate account:', error);
    },
  });

  return {
    // Account status
    isActivated: accountStatus?.isActivated ?? false,
    isChecking,
    checkError,
    
    // Activation
    activateAccount,
    isActivating,
    activationError,
    
    // Computed states
    needsActivation: !isChecking && !accountStatus?.isActivated,
    isReady: !isChecking && accountStatus?.isActivated,
  };
}; 