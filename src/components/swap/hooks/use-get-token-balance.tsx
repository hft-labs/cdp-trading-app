import { useMemo } from 'react';
import { erc20Abi, formatUnits } from 'viem';
import type { Address } from 'viem';
import { useReadContract } from 'wagmi';
import type { UseReadContractReturnType } from 'wagmi';
import { getRoundedAmount } from '@/components/swap/utils/get-rounded-amount';
import type { SwapError } from '@/components/swap/types';
import type { Token } from '@/types/token';
import type { UseGetTokenBalanceResponse } from '@/components/swap/types';

export function useGetTokenBalance(
  address?: Address,
  token?: Token,
): UseGetTokenBalanceResponse {
  const tokenBalanceResponse: UseReadContractReturnType = useReadContract({
    abi: erc20Abi,
    address: token?.address as Address,
    functionName: 'balanceOf',
    args: address ? [address] : [],
    query: {
      enabled: !!token?.address && !!address,
    },
  });

  return useMemo(() => {
    let error: SwapError | undefined;
    if (tokenBalanceResponse?.error) {
      error = {
        code: 'balance',
        error: tokenBalanceResponse?.error?.shortMessage,
        message: '',
      };
    }
    if (
      (tokenBalanceResponse?.data !== BigInt(0) && !tokenBalanceResponse?.data) ||
      !token
    ) {
      return {
        convertedBalance: '',
        status: tokenBalanceResponse.status,
        error,
        roundedBalance: '',
        response: tokenBalanceResponse,
        refetch: tokenBalanceResponse.refetch,
      };
    }
    const convertedBalance = formatUnits(
      tokenBalanceResponse?.data as bigint,
      token?.decimals,
    );
    return {
      convertedBalance,
      status: tokenBalanceResponse.status,
      error,
      response: tokenBalanceResponse,
      roundedBalance: getRoundedAmount(convertedBalance, 8),
      refetch: tokenBalanceResponse.refetch,
    };
  }, [token, tokenBalanceResponse]);
}