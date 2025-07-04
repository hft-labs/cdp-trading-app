import { useMemo } from 'react';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useBalance } from 'wagmi';
import type { UseBalanceReturnType } from 'wagmi';
import { DEFAULT_QUERY_OPTIONS } from '@/components/swap/constants';
import { getRoundedAmount } from '@/components/swap/utils/get-rounded-amount';
import type { SwapError } from '@/components/swap/types';
import type { UseGetETHBalanceResponse } from '@/components/swap/types';

const ETH_DECIMALS = 18;

export function useGetETHBalance(address?: Address): UseGetETHBalanceResponse {
  const ethBalanceResponse: UseBalanceReturnType = useBalance({
    address,
    query: {
      ...DEFAULT_QUERY_OPTIONS,
    },
  });

  return useMemo(() => {
    let error: SwapError | undefined;
    if (ethBalanceResponse?.error) {
      error = {
        code: 'balance',
        error: ethBalanceResponse?.error?.message,
        message: '',
      };
    }
    if (
      !ethBalanceResponse?.data?.value &&
      ethBalanceResponse?.data?.value !== BigInt(0)
    ) {
      return {
        convertedBalance: '',
        roundedBalance: '',
        error,
        response: ethBalanceResponse,
      };
    }
    const convertedBalance = formatUnits(
      ethBalanceResponse?.data?.value,
      ETH_DECIMALS,
    );
    const roundedBalance = getRoundedAmount(convertedBalance, 8);
    return {
      convertedBalance,
      error,
      response: ethBalanceResponse,
      roundedBalance,
    };
  }, [ethBalanceResponse]);
}