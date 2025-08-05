'use client';

import { yupResolver } from "@hookform/resolvers/yup";
import { strictEmailSchema, yupObject } from "@/lib/schema-fields";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSignInWithEmail, useVerifyEmailOTP } from "@coinbase/cdp-hooks";
import * as yup from "yup";
import { useRouter } from "next/navigation";

function OTP(props: {
  onBack: () => void,
  flowId: string,
}) {
  const [otp, setOtp] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const verifyEmailOTP = useVerifyEmailOTP();
  const router = useRouter();

  useEffect(() => {
    if (otp.length === 6 && !submitting) {
      setSubmitting(true);
      console.log("Verifying OTP", props.flowId, otp);
      verifyEmailOTP({
        flowId: props.flowId,
        otp
      })
        .then(result => {
          console.log("Signed in user:", result.user);
          router.push('/beta');
        })
        .catch(e => {
          console.error("OTP verification failed:", e);
          setError("Invalid code. Please try again.");
        })
        .finally(() => {
          setSubmitting(false);
          setOtp('');
        });
    }
    if (otp.length !== 0 && otp.length !== 6) {
      setError(null);
    }
  }, [otp, submitting, props.flowId, verifyEmailOTP]);

  return (
    <div className="flex flex-col items-stretch w-full">
      <form className='w-full flex flex-col items-center mb-4'>
        <span className='mb-4 text-gray-300 text-center'>Enter the code from your email</span>
        <InputOTP
          maxLength={6}
          type="text"
          inputMode="text"
          pattern={"^[a-zA-Z0-9]+$"}
          value={otp}
          onChange={value => setOtp(value.toUpperCase())}
          disabled={submitting}
          className="mb-4"
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </form>
      <Button variant='link' onClick={props.onBack} className='text-gray-400 hover:text-white underline'>
        Cancel
      </Button>
    </div>
  );
}

export function MagicLinkSignIn() {
  const [loading, setLoading] = useState(false);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  const signInWithEmail = useSignInWithEmail();

  const schema = yupObject({
    email: strictEmailSchema('Please enter a valid email').required('Please enter your email')
  });

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    setLoading(true);
    try {
      const { email } = data;
      setEmail(email);
      
      // Start sign in flow with CDP hooks
      const result = await signInWithEmail({ email });
      setFlowId(result.flowId);
      
    } catch (e) {
      console.error("Sign in failed:", e);
      setError('email', { type: 'manual', message: 'Failed to send verification code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (flowId) {
    return <OTP flowId={flowId} onBack={() => setFlowId(null)} />;
  } else {
    return (
      <form
        className="flex flex-col items-stretch w-full"
        onSubmit={e => handleSubmit(onSubmit)(e)}       
        noValidate
      >
        <div className="mb-4">
          <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register('email')}
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.email.message?.toString()}
            </span>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gray-200 text-black hover:bg-gray-300 font-medium py-2 px-4 rounded-md transition-colors"
          disabled={loading}
        >
          {loading ? "Sending..." : "Continue with Email"}
        </Button>
      </form>
    );
  }
}