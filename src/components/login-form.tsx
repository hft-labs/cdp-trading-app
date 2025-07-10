"use client";
import { useEffect, useState } from "react";
import { useLoginWithEmail, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { Loader2Icon } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UserPill } from "@privy-io/react-auth/ui";



export function LoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { sendCode, loginWithCode, state } = useLoginWithEmail();
  const [step, setStep] = useState(0);
  const router = useRouter();
  const privy = usePrivy();
  
  const statusMessages = {
    "initial": "Sign in with email",
    "sending-code": "Sending code...",
    "awaiting-code-input": "Enter code",
    "submitting-code": "Logging in...",
    "done": "Logged in",
    "error": "An error occurred. Please try again."
  }
  const buttonText = {
    "initial": "Continue",
    "sending-code": "Sending code...",
    "awaiting-code-input": "Enter code",
    "submitting-code": "Logging in...",
    "done": "Logged in",
    "error": "Retry"
  }

  const getStatusMessage = () => {
    if (step === 0) {
      return "Sign in with email";
    } else if (step === 1) {
      return "Enter code";
    }
  }
  const handleClick = () => {
    if (step === 0) {
      sendCode({ email });
      setStep(1);
    } else if (step === 1 && state.status !== "error") {
      loginWithCode({ code });
    }else if (state.status === "error" && step === 1) {
      setStep(0);
      setEmail("");
      setCode("");
    }
    console.log(state.status);
    console.log('handleClick');
    console.log(step);
  }
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs mx-auto p-0">
      <div>{state.status}</div>
      <div>{step}</div>
      <h2 className="text-base font-semibold mb-1 text-white">{statusMessages[state.status as keyof typeof statusMessages]}</h2>
      <div className="w-full flex flex-col items-center gap-1">
        {step === 0 && (
          <Input
            id="email"
            type="email"
            className="w-full px-2 py-1 rounded border border-gray-700 bg-black text-white focus:outline-none focus:ring-1 focus:ring-blue-500 mb-1 text-sm"
            onChange={(e) => setEmail(e.currentTarget.value)}
            value={email}
          />
        )}
        {step === 1 && (
          <InputOTP
            id="otp"
            maxLength={6}
            value={code}
            onChange={setCode}
            containerClassName="justify-center mb-1"
            onPaste={e => {
              const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 6);
              setCode(pasted);
              e.preventDefault();
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        )}

        <Button className="bg-white text-black text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mb-2" size="sm" disabled={state.status === "sending-code" || state.status === "done"} onClick={handleClick}>
          {state.status === "sending-code" && <Loader2Icon className="animate-spin" />}
          {buttonText[state.status as keyof typeof buttonText]}
        </Button>
      </div>
      <div className="h-4 text-red-400 text-xs">{state.status === "error" && state.error?.message}</div>
    </div>
  );
}