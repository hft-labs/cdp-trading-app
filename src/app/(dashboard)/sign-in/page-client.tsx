"use client";

import { useCurrentUser } from "@coinbase/cdp-hooks";
import { MagicLinkSignIn } from "@/components/sign-in-component";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function PageClient() {
	const user = useCurrentUser();
	useEffect(() => {
		if (user) {
			redirect("/beta");
		}
	}, [user]);
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-50px)]">
                <div className="w-full max-w-sm mx-auto px-6">
                    <div className="flex flex-col items-center mb-8">
                        <h1 className="text-2xl font-semibold text-white mb-2 text-center">
                            Sign in to hft.studio
                        </h1>
                        
                        <p className="text-sm text-gray-400 text-center">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <div className="w-full">
                        <MagicLinkSignIn />
                    </div>
\
                </div>
            </div>
    )
}