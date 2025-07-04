import { RequestContext } from '@/core/network/constants';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { base } from 'viem/chains';
import { useValue } from '@/components/swap/hooks/use-value';
import type { Token } from '@/types/token';
import { useFromTo } from '@/components/swap/hooks/use-from-to';
import { useLifecycleStatus } from '@/components/swap/hooks/use-lifecycle-status';
import { LifecycleStatus, SwapContextType, SwapProviderReact } from '@/components/swap/types';
import { Address } from 'viem';
import { useResetInputs } from '@/components/swap/hooks/use-reset-inputs';
import { FALLBACK_DEFAULT_MAX_SLIPPAGE } from '@/components/swap/constants';

const emptyContext = {} as SwapContextType;

export const SwapContext = createContext<SwapContextType>(emptyContext);

export function useSwapContext() {
    const context = useContext(SwapContext);
    if (context === emptyContext) {
        throw new Error('useSwapContext must be used within a Swap component');
    }
    return context;
}

export function SwapProvider({
    children,
    config = {
        maxSlippage: FALLBACK_DEFAULT_MAX_SLIPPAGE;
    },
    onError,
    onSuccess,
    onStatus,
    address,
}: SwapProviderReact) {

    const [isToastVisible, setIsToastVisible] = useState(false);
    const [transactionHash, setTransactionHash] = useState('');
    const [hasHandledSuccess, setHasHandledSuccess] = useState(false);
    const { from, to } = useFromTo(address);

    // Refreshes balances and inputs post-swap
    const resetInputs = useResetInputs({ from, to });
    const [lifecycleStatus, updateLifecycleStatus] = useLifecycleStatus({
        statusName: 'init',
        statusData: {
            isMissingRequiredField: true,

        },
    });

    // Component lifecycle emitters
    useEffect(() => {
        // Error
        if (lifecycleStatus.statusName === 'error') {
            onError?.(lifecycleStatus.statusData);
        }
        // Success
        if (lifecycleStatus.statusName === 'success') {
            onSuccess?.(lifecycleStatus.statusData.transactionReceipt);
            setTransactionHash(
                lifecycleStatus.statusData?.transactionReceipt.transactionHash,
            );
            setHasHandledSuccess(true);
            setIsToastVisible(true);
        }
        // Emit Status
        onStatus?.(lifecycleStatus);
    }, [
        onError,
        onStatus,
        onSuccess,
        lifecycleStatus,
        lifecycleStatus.statusData, // Keep statusData, so that the effect runs when it changes
        lifecycleStatus.statusName, // Keep statusName, so that the effect runs when it changes
        from.amount,
        from.token?.symbol,
        to.token?.symbol,
        address,
    ]);

    useEffect(() => {
        // Reset inputs after status reset. `resetInputs` is dependent
        // on 'from' and 'to' so moved to separate useEffect to
        // prevents multiple calls to `onStatus`
        if (lifecycleStatus.statusName === 'init' && hasHandledSuccess) {
            setHasHandledSuccess(false);
            resetInputs();
        }
    }, [hasHandledSuccess, lifecycleStatus.statusName, resetInputs]);


    const handleToggle = useCallback(() => {
        from.setAmount(to.amount);
        to.setAmount(from.amount);
        from.setToken?.(to.token);
        to.setToken?.(from.token);

        updateLifecycleStatus({
            statusName: 'amountChange',
            statusData: {
                amountFrom: from.amount,
                amountTo: to.amount,
                tokenFrom: from.token,
                tokenTo: to.token,
                // token is missing
                isMissingRequiredField:
                    !from.token || !to.token || !from.amount || !to.amount,
            },
        });
    }, [from, to, updateLifecycleStatus]);

    const handleAmountChange = useCallback(
        async (
            type: 'from' | 'to',
            amount: string,
            sToken?: Token,
            dToken?: Token,
        ) => {
            const source = type === 'from' ? from : to;
            const destination = type === 'from' ? to : from;

            source.token = sToken ?? source.token;
            destination.token = dToken ?? destination.token;

            // if token is missing alert user via isMissingRequiredField
            if (source.token === undefined || destination.token === undefined) {
                updateLifecycleStatus({
                    statusName: 'amountChange',
                    statusData: {
                        amountFrom: from.amount,
                        amountTo: to.amount,
                        tokenFrom: from.token,
                        tokenTo: to.token,
                        // token is missing
                        isMissingRequiredField: true,
                    },
                });
                return;
            }
            if (amount === '' || amount === '.' || Number.parseFloat(amount) === 0) {
                destination.setAmount('');
                destination.setAmountUSD('');
                source.setAmountUSD('');
                return;
            }

            // When toAmount changes we fetch quote for fromAmount
            // so set isFromQuoteLoading to true
            destination.setLoading(true);
            updateLifecycleStatus({
                statusName: 'amountChange',
                statusData: {
                    // when fetching quote, the previous
                    // amount is irrelevant
                    amountFrom: type === 'from' ? amount : '',
                    amountTo: type === 'to' ? amount : '',
                    tokenFrom: from.token,
                    tokenTo: to.token,
                    // when fetching quote, the destination
                    // amount is missing
                    isMissingRequiredField: true,
                },
            });

            try {
                const response = await getSwapQuote(
                    {
                        amount,
                        amountReference: 'from',
                        from: source.token,
                        to: destination.token,
                    },
                    RequestContext.Swap,
                );
                // If request resolves to error response set the quoteError
                // property of error state to the SwapError response
                if (isSwapError(response)) {
                    updateLifecycleStatus({
                        statusName: 'error',
                        statusData: {
                            code: response.code,
                            error: response.error,
                            message: '',
                        },
                    });
                    return;
                }
                const formattedAmount = formatTokenAmount(
                    response.toAmount,
                    response.to.decimals,
                );
                destination.setAmountUSD(response.toAmountUSD);
                destination.setAmount(formattedAmount);
                source.setAmountUSD(response.fromAmountUSD);
                updateLifecycleStatus({
                    statusName: 'amountChange',
                    statusData: {
                        amountFrom: type === 'from' ? amount : formattedAmount,
                        amountTo: type === 'to' ? amount : formattedAmount,
                        tokenFrom: from.token,
                        tokenTo: to.token,
                        // if quote was fetched successfully, we
                        // have all required fields
                        isMissingRequiredField: !formattedAmount,
                    },
                });
            } catch (err) {
                updateLifecycleStatus({
                    statusName: 'error',
                    statusData: {
                        code: 'TmSPc01', // Transaction module SwapProvider component 01 error
                        error: JSON.stringify(err),
                        message: '',
                    },
                });
            } finally {
                // reset loading state when quote request resolves
                destination.setLoading(false);
            }
        },
        [from, to, lifecycleStatus, updateLifecycleStatus],
    );

    const handleSubmit = useCallback(async () => {
        if (!address || !from.token || !to.token || !from.amount) {
            return;
        }

        try {

            console.log('handleSubmit');


        } catch (err) {
            updateLifecycleStatus({
                statusName: 'error',
                statusData: {
                    code: 'TmSPc02',
                    error: JSON.stringify(err),
                    message: 'Swap failed',
                },
            });
        }
    }, [
        address,
        from.amount,
        from.token,
        lifecycleStatus,
        to.token,
        updateLifecycleStatus,
    ]);

    const value = useValue({
        address,
        from,
        handleAmountChange,
        handleToggle,
        handleSubmit,
        lifecycleStatus,
        updateLifecycleStatus,
        to,
        isToastVisible,
        setIsToastVisible,
        setTransactionHash,
        transactionHash,
    });

    return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}