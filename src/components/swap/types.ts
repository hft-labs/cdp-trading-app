import { TransactionReceipt } from "viem";
import { Hex } from "viem";
import { Token } from "../../types/token";
import { Dispatch, SetStateAction } from "react";
import type {
  UseBalanceReturnType,
  UseReadContractReturnType,
} from 'wagmi';
import { Address } from "viem";

export type SwapError = {
  code: string;
  error: string;
  message: string;
};

export type LifecycleStatus =
  | {
      statusName: 'init';
      statusData: {
        isMissingRequiredField?: boolean;
      };
    }
  | {
      statusName: 'error';
      statusData: SwapError & {
        isMissingRequiredField?: boolean;
      };
    }
  | {
      statusName: 'amountChange';
      statusData: {
        amountFrom?: string;
        amountETH?: string;
        amountUSDC?: string;
        amountTo?: string;
        tokenFrom?: Token;
        tokenFromETH?: Token;
        tokenFromUSDC?: Token;
        tokenTo?: Token;
        isMissingRequiredField?: boolean;
      };
    }
  | {
      statusName: 'transactionPending';
      statusData: {
        isMissingRequiredField?: boolean;
      };
    }
  | {
      statusName: 'transactionApproved';
      statusData: {
        callsId?: Hex;
        transactionHash?: Hex;
        isMissingRequiredField?: boolean;
      };
    }
  | {
      statusName: 'success';
      statusData: {
        transactionReceipt: TransactionReceipt;
        isMissingRequiredField?: boolean;
      };
    };

    export type SwapUnit = {
      amount: string;
      amountUSD: string;
      balance?: string;
      balanceResponse?: UseBalanceReturnType | UseReadContractReturnType;
      error?: SwapError;
      loading: boolean;
      setAmount: Dispatch<SetStateAction<string>>;
      setAmountUSD: Dispatch<SetStateAction<string>>;
      setLoading: Dispatch<SetStateAction<boolean>>;
      setToken?: Dispatch<SetStateAction<Token | undefined>>;
      token: Token | undefined;
    };

    export type SwapContextType = {
      address?: Address; // Used to check if user is connected in SwapButton
      from: SwapUnit;
      lifecycleStatus: LifecycleStatus;
      handleAmountChange: (
        t: 'from' | 'to',
        amount: string,
        st?: Token,
        dt?: Token,
      ) => void;
      handleSubmit: () => void;
      handleToggle: () => void;
      updateLifecycleStatus: (
        state: LifecycleStatus,
      ) => void; // A function to set the lifecycle status of the component
      to: SwapUnit;
      isToastVisible: boolean;
      setIsToastVisible: (visible: boolean) => void;
      transactionHash: string;
      setTransactionHash: (hash: string) => void;
    };

    export type UseGetTokenBalanceResponse = {
      error?: SwapError;
      response?: UseReadContractReturnType;
      convertedBalance?: string;
      roundedBalance?: string;
      status: UseReadContractReturnType['status'];
      refetch: UseReadContractReturnType['refetch'];
    };
    export type FromTo = {
      from: SwapUnit;
      to: SwapUnit;
    };

    export type UseGetETHBalanceResponse = {
      error?: SwapError;
      response?: UseBalanceReturnType;
      convertedBalance?: string;
      roundedBalance?: string;
    };

    export type SwapProviderReact = {
      children: React.ReactNode;
      config?: {
        maxSlippage: number; 
      };
      onError?: (error: SwapError) => void; 
      onStatus?: (lifecycleStatus: LifecycleStatus) => void; 
      onSuccess?: (transactionReceipt: TransactionReceipt) => void; 
      address: Address;
    };