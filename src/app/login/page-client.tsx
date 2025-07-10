"use client";

import Threads from "@/components/threads";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const LoginButton = () => {
    const { ready, login } = usePrivy();
    
    return (
        <Button onClick={() =>{
            console.log('login');
            login();
        }} size="lg" variant="outline">
            Login {ready}
        </Button>
    )
}
export default function PageClient() {
    const { ready, user } = usePrivy();
    const router = useRouter();
    useEffect(() => {
        if (ready && user !== null) {
            router.push('/');
        }
    }, [ready, user]);
    return (
        <div className="flex flex-grow flex-col ">
            <div className="absolute inset-0 z-0">
                <Threads
                    amplitude={0.5}
                    distance={0}
                    enableMouseInteraction={false}
                />
            </div>
            <div className="flex-grow"></div>
            <div className="left-0 w-full flex justify-center pb-6 z-10">
                <LoginButton  />
            </div>
        </div>
    );
}