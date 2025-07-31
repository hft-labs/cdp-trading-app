import { ResolvedRegister, type Config } from "wagmi";
import {
    UseSendCallsParameters,
    UseSendCallsReturnType,
    useWriteContract,
    useAccount,
} from "wagmi";
import { useMemo, useState } from "react";
import { TransactionExecutionError } from "viem";
import { CallStatus } from "./call-status";

export type TransactButtonProps<
    config extends Config = Config,
    context = unknown,
> = UseSendCallsReturnType<config, context>["sendCalls"]["arguments"] & {
    mutation?: UseSendCallsParameters<config, context>["mutation"];
} & { text: string };

export function TransactButton<
    config extends Config = ResolvedRegister["config"],
    context = unknown,
>({ mutation, text, ...rest }: TransactButtonProps<config, context>) {
    const [error, setError] = useState<string | undefined>(undefined);
    const [id, setId] = useState<string | undefined>(undefined);
    const { status: walletStatus } = useAccount();
    const { writeContract, status, data } = useWriteContract({
        mutation: {
            ...mutation,
            onError: (e) => {
                console.log('mutation error', e);
                if (
                    (e as TransactionExecutionError).cause?.name ==
                    "UserRejectedRequestError"
                ) {
                    setError("User rejected request");
                } else if (e.message.includes("Connector not connected")) {
                    setError("Wallet not connected. Please connect your wallet first.");
                } else {
                    setError(e.message);
                }
                if (mutation?.onError) mutation.onError(e);
            },
            onSuccess: (id) => {
                setId(id);
                console.log('mutation success', id);
                if (mutation?.onSuccess) mutation.onSuccess(id);
            },
        },
    });

    const displayText = useMemo(() => {
        if (walletStatus !== 'connected') {
            return "Connect Wallet";
        }
        if (status == "pending") {
            setError(undefined);
            setId(undefined);
            return "Confirm in popup";
        }
        return text;
    }, [status, error, walletStatus, text]);

    return (
        <>
            <button
                onClick={() => {
                    if (walletStatus !== 'connected') {
                        setError("Wallet not connected. Please connect your wallet first.");
                        return;
                    }
                    
                    console.log('rest', rest);
                    if (rest.contracts && rest.contracts.length > 0) {
                        const contract = rest.contracts[0];
                        console.log('contract call object', contract);
                        if (!Array.isArray(contract.args)) {
                            console.error('args is not an array!', contract.args);
                            return;
                        }
                        console.log('args:', contract.args, 'types:', contract.args.map((arg: any) => typeof arg));
                        if ((contract.args as any[]).some((arg: any) => arg === undefined || arg === null)) {
                            console.error('One or more args are undefined or null!', contract.args);
                            return;
                        }
                        // For approve(address, uint256), check that the second arg is a valid type for BigInt
                        if (contract.args.length > 1 && !['bigint', 'number', 'string'].includes(typeof contract.args[1])) {
                            console.error('Second arg (amount) is not a valid type for BigInt:', contract.args[1]);
                            return;
                        }
                        writeContract(contract);
                    } else {
                        console.error('No contracts to write');
                    }
                }}
                disabled={status == "pending" || walletStatus !== 'connected'}
            >
                {displayText}
            </button>
            <p>error: {error}</p>
            <p>id: {id}</p>
            {!id && error && <p>error: {error}</p>}
            {<p>data: {JSON.stringify(data)}</p>}
            {id && <CallStatus id={id} />}
        </>
    );
}