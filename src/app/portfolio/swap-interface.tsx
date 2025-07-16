"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { baseTokens, getTokenBySymbol, Token } from "@/lib/tokens"

export function SwapInterface() {
  // Default: Buy cbBTC with USDC
  const defaultPayToken = getTokenBySymbol("USDC") as Token;
  const defaultReceiveToken = getTokenBySymbol("cbBTC") as Token;
  const [activeTab, setActiveTab] = useState("Buy")
  const [orderType, setOrderType] = useState("One-time order")
  const [payToken, setPayToken] = useState<Token>(defaultPayToken)
  const [receiveToken, setReceiveToken] = useState<Token>(defaultReceiveToken)
  const [payAmount, setPayAmount] = useState<string>("");

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-gray-700 rounded-full p-1">
            {["Buy", "Sell", "Convert"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full text-sm">
            {orderType}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Display */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <input
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="bg-transparent outline-none border-none text-8xl font-light text-white w-48 text-right pr-2"
                style={{ maxWidth: '10ch' }}
              />
              <span className="text-7xl font-light text-gray-400">{payToken.symbol}</span>
            </div>
            <button className="bg-gray-700 px-4 py-2 rounded-full text-sm" onClick={() => setPayAmount("3.1")}>Max</button>
          </div>
          {/* Show calculated receive amount (placeholder for now) */}
          <div className="flex items-center gap-2 text-blue-400 text-lg justify-center">
            <span className="text-sm">↗</span>
            <span>0 {receiveToken.symbol}</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4 mb-8">
          {/* Pay with Token */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <img src={payToken.image} alt={payToken.symbol} className="w-10 h-10 rounded-full" />
              <div>
                <div className="text-white font-medium">Pay with</div>
                <div className="text-gray-400">{payToken.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-white">$1.11</div>
                <div className="text-gray-400 text-sm">Available</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Buy Token */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <img src={receiveToken.image} alt={receiveToken.symbol} className="w-10 h-10 rounded-full" />
              <div>
                <div className="text-white font-medium">Buy</div>
                <div className="text-gray-400">{receiveToken.name}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Review Order Button */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-medium">
          Review order
        </Button>
      </div>
    </div>
  )
}