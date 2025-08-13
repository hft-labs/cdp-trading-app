import { useQuery } from "@tanstack/react-query";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";

export const useAccountStatus = () => {
  const { currentUser } = useCurrentUser();
  const { evmAddress } = useEvmAddress();

  const { data: accountStatus, isLoading, error } = useQuery({
    queryKey: ['account-status', evmAddress],
    queryFn: async (): Promise<{ isActivated: boolean }> => {
      if (!evmAddress || !currentUser) {
        return { isActivated: false };
      }

      try {
        // Check if account exists using the dedicated account status API
        const response = await fetch(`/api/account-status?address=${evmAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          return { isActivated: data.isActivated };
        } else {
          return { isActivated: false };
        }
      } catch (error) {
        return { isActivated: false };
      }
    },
    enabled: !!evmAddress && !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    isActivated: accountStatus?.isActivated ?? false,
    isLoading,
    error,
  };
}; 