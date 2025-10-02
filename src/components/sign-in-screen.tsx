"use client";

import { AuthButton } from "@/components/ui/auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

export default function SignInScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle>
            <Typography type="h1" className="sr-only">Sign in</Typography>
            <Typography type="h2">Welcome!</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Typography variant="secondary">Please sign in to continue.</Typography>
          <AuthButton />
        </CardContent>
      </Card>
    </div>
  );
}
