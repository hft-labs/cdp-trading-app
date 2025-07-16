"use client"

import React from "react"
import { TokenSection } from "./token-section"
import { SwapButton } from "@/components/swap/swap-button"
import { SwitchButton } from "./switch-button"

export function SwapWidget() {
  return (
    <div className="min-h-screen bg-black flex  justify-center p-4">
      <div className="">
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
    </div>
  )
}
