"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { TokenSection } from "./token-section"
import { SwapButton } from "@/components/swap/swap-button"
import { SwitchButton } from "./switch-button"
import { usePrivy } from "@privy-io/react-auth"
import { UserPill } from "@privy-io/react-auth/ui"

export function SwapWidget() {
  const { ready, authenticated, user, } = usePrivy();
  if (!ready) {
    return <div>Loading...</div>
  }

  console.log(user);


  return (
    <div className="flex flex-col bg-black min-h-screen justify-center items-center">
     
      <div className=" bg-black flex justify-center items-center p-4">
        <Card className="w-full max-w-lg bg-black border-gray-800 rounded-3xl">
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <div className="text-gray-200 text-base md:text-lg font-bold pl-1">Sell</div>
              <TokenSection type="from" />
            </div>
            <div className="flex justify-center -my-2 relative z-10">
              <SwitchButton />
            </div>
            <div className="space-y-1">
              <div className="text-gray-200 text-base md:text-lg font-bold pl-1">Buy</div>
              <TokenSection type="to" />
            </div>
            <div className="pt-4">
              <SwapButton />
            </div>
          </div>
          
        </Card>
        

      </div>
    </div>
  )
}


