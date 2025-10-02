"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsSignedIn, useSignOut, useSignInWithEmail, useVerifyEmailOTP } from "@coinbase/cdp-hooks";
import { forwardRef, useState } from "react";
import { X } from "lucide-react";

interface AuthButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ variant = "outline", size = "default", className, ...props }, ref) => {
    const { isSignedIn } = useIsSignedIn();
    const { signOut } = useSignOut();
    const { signInWithEmail } = useSignInWithEmail();
    const { verifyEmailOTP } = useVerifyEmailOTP();
    
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [flowId, setFlowId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSignOut = async () => {
      setIsLoading(true);
      try {
        await signOut();
      } catch (error) {
        console.error("Sign out failed:", error);
        setError("Sign out failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const handleSignIn = () => {
      setShowModal(true);
      setError(null);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const result = await signInWithEmail({ email });
        setFlowId(result.flowId);
      } catch (error) {
        console.error("Sign in failed:", error);
        setError("Failed to send OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!flowId || !otp) return;
      
      setIsLoading(true);
      setError(null);
      try {
        await verifyEmailOTP({ flowId, otp });
        setShowModal(false);
        setEmail("");
        setOtp("");
        setFlowId(null);
      } catch (error) {
        console.error("OTP verification failed:", error);
        setError("Invalid OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const closeModal = () => {
      setShowModal(false);
      setEmail("");
      setOtp("");
      setFlowId(null);
      setError(null);
    };

    return (
      <>
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={className}
          onClick={isSignedIn ? handleSignOut : handleSignIn}
          disabled={isLoading}
          {...props}
        >
          {isLoading ? "Loading..." : isSignedIn ? "Sign Out" : "Sign In"}
        </Button>

        {/* Custom Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {flowId ? "Enter verification code" : "Sign in"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}
                
                {!flowId ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Sending..." : "Continue"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter the 6-digit code sent to {email}</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFlowId(null);
                          setOtp("");
                          setError(null);
                        }}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </>
    );
  }
);

AuthButton.displayName = "AuthButton"; 