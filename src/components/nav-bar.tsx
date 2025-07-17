"use client";

import { useTheme } from "next-themes";
import { UserButton } from "@stackframe/stack";
import { Logo } from "./logo";

export default function NavBar() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <div className="w-full flex">
            <div className="flex flex-col flex-grow w-0">
                <div className="h-14 border-b flex items-center justify-between sticky top-0 backdrop-blur-md bg-white/20 dark:bg-black/20 z-10 px-4 md:px-6">
                    <div className="hidden md:flex items-center h-full">
                        <Logo />
                    </div>
                    <div className="flex gap-4">
                        <UserButton
                            colorModeToggle={() =>
                                setTheme(resolvedTheme === "light" ? "dark" : "light")
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}