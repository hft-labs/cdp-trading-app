"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useSwapProvider } from "./swap-provider";

export function SwapButton() {
  const user = useUser();
  const isSignedIn = user !== null;
  const router = useRouter();

  const onClick = () => {
    if (isSignedIn) {
      console.log("handleTokenSwap");
    } else {
      router.push("/handler/sign-in");
    }
  }
  const text = isSignedIn ? "Swap" : "Sign in to swap";
  return (
    <Button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg"
    >
      {text}
    </Button>
  );
}
