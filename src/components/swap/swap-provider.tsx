"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SwapContextType {
    fromAmount: string;
    setFromAmount: (val: string) => void;
    toAmount: string;
    setToAmount: (val: string) => void;
    fromToken: string;
    setFromToken: (val: string) => void;
    toToken: string;
    setToToken: (val: string) => void;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider = ({ children }: { children: ReactNode }) => {
    const [fromAmount, setFromAmount] = useState("1");
    const [toAmount, setToAmount] = useState("");
    const [fromToken, setFromToken] = useState("WETH");
    const [toToken, setToToken] = useState("USDC");

    return (
        <SwapContext.Provider
            value={{
                fromAmount,
                setFromAmount,
                toAmount,
                setToAmount,
                fromToken,
                setFromToken,
                toToken,
                setToToken,
            }}
        >
            {children}
        </SwapContext.Provider>
    );
};

export const useSwapProvider = () => {
    const context = useContext(SwapContext);
    if (!context) {
        throw new Error("useSwapProvider must be used within a SwapProvider");
    }
    return context;
}; 