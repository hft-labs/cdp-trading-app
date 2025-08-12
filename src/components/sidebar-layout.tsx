'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Typography } from "@/components/ui/typography";
import {
    LucideIcon,
    Menu,
    PieChart,
    Receipt,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Logo } from "./logo";
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { useCurrentUser } from "@coinbase/cdp-hooks";

type BreadcrumbItem = { item: React.ReactNode, href: string }

type Label = {
    name: React.ReactNode,
    type: 'label',
};

type Item = {
    name: React.ReactNode,
    href: string,
    icon: LucideIcon,
    regex: RegExp,
    type: 'item',
    requiresDevFeatureFlag?: boolean,
};

type Hidden = {
    name: BreadcrumbItem[] | ((pathname: string) => BreadcrumbItem[]),
    regex: RegExp,
    type: 'hidden',
};
// what is a good icon
const navigationItems: (Label | Item | Hidden)[] = [
    {
        name: "Portfolio",
        href: "/portfolio",
        regex: /^\/portfolio\/?$/,
        icon: PieChart,
        type: 'item'
    },
    {
        name: "Transactions",
        href: "/transactions",
        regex: /^\/transactions\/?$/,
        icon: Receipt,
        type: 'item'
    }
];

function NavItem({ item, href, onClick, alwaysWhite }: { item: Item, href: string, onClick?: () => void, alwaysWhite?: boolean }) {
    const pathname = usePathname();
    const selected = useMemo(() => {
        let pathnameWithoutTrailingSlash = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
        return item.regex.test(pathnameWithoutTrailingSlash);
    }, [item.regex, pathname]);

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 w-full px-4 py-2 my-1 transition-colors font-medium text-base group",
                alwaysWhite
                    ? "rounded-full"
                    : selected
                        ? "bg-[#0A1736]/80 text-[#4F8EF9] rounded-full"
                        : "rounded-full hover:bg-[#0A1736]",
            )}
            style={{ minHeight: 44 }}
            onClick={onClick}
            prefetch={true}
        >
            <item.icon className={cn(
                "h-5 w-5",
                alwaysWhite ? "text-white" : selected ? "text-[#4F8EF9]" : "text-white group-hover:text-white"
            )} />
            <span className={alwaysWhite ? "text-white" : selected ? "text-[#4F8EF9]" : "text-white group-hover:text-white"}>{item.name}</span>
        </Link>
    );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <div className="flex flex-col h-full items-stretch bg-black">
            <div className="h-14 border-b flex items-center px-2 shrink-0">
                <div className="flex-grow mx-2">
                    <Logo />
                </div>
            </div>
            <div className="flex flex-grow flex-col gap-1 pt-2 overflow-y-auto">
                {navigationItems.map((item, index) => {
                    if (item.type === 'label') {
                        return <Typography key={index} className="pl-2 mt-3" type="label" variant="secondary">
                            {item.name}
                        </Typography>;
                    } else if (item.type === 'item') {
                        return <div key={index} className="flex px-2">
                            <NavItem item={item} onClick={onNavigate} href={`${item.href}`} />
                        </div>;
                    }
                })}

                <div className="flex-grow" />

                {/* <div className="py-2 px-2 flex">
                    <NavItem
                        onClick={onNavigate}
                        item={{
                            name: "Documentation",
                            type: "item",
                            href: "",
                            icon: Book,
                            regex: /^$/,
                        }}
                        href={"/"}
                        alwaysWhite={true}
                    />
                </div> */}
            </div>
        </div>
    );
}

function PageHeader() {
    const pathname = usePathname();
    const activeItem = navigationItems.find(
        (item) => item.type === "item" && item.regex.test(pathname)
    );
    if (!activeItem) return null;
    // Only render if name is a string or valid ReactNode (not a function or array)
    if (typeof activeItem.name === 'string' || typeof activeItem.name === 'number') {
        return (
            <h1 className="text-2xl font-bold text-white">
                {activeItem.name}
            </h1>
        );
    }
    return null;
}

interface SidebarLayoutProps {
    children?: React.ReactNode;
    showAuth?: boolean;
}

export default function SidebarLayout({
    children,
    showAuth = true,
}: SidebarLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentUser } = useCurrentUser();
    const isSignedIn = currentUser !== null;
    return (
        <div className="w-full flex">
            {isSignedIn && <div className="flex-col border-r min-w-[240px] h-screen sticky top-0 hidden md:flex backdrop-blur-md bg-white/20 dark:bg-black/20 z-[10]">
                <SidebarContent />
            </div>}
            {!isSignedIn && <div className="flex-col min-w-[240px] h-screen sticky top-0 hidden md:flex backdrop-blur-md bg-white/20 dark:bg-black/20 z-[10]">
                <div className="h-14 border-b flex items-center px-2 shrink-0">
                    <div className="flex-grow mx-2">
                        <Logo />
                    </div>
                </div>
            </div>}
            <div className="flex flex-col flex-grow w-0">
                <div className="h-14 border-b flex items-center justify-between sticky top-0 backdrop-blur-md bg-white/20 dark:bg-black/20 z-10 px-4 md:px-6">
                    {isSignedIn && <div className="hidden md:flex items-center h-full">
                        <PageHeader />
                    </div>}

                    <div className="flex md:hidden items-center">
                        <Sheet onOpenChange={(open) => setSidebarOpen(open)} open={sidebarOpen}>
                            <SheetTitle className="hidden">
                                Sidebar Menu
                            </SheetTitle>
                            <SheetTrigger>
                                <Menu />
                            </SheetTrigger>
                            <SheetContent
                                aria-describedby={undefined}
                                side='left' className="w-[240px] p-0">
                                <SidebarContent onNavigate={() => setSidebarOpen(false)} />
                            </SheetContent>
                        </Sheet>

                        <div className="ml-4 flex md:hidden">
                        </div>
                    </div>

                    <div className="flex gap-4">
                       {isSignedIn && <AuthButton />}
                    </div>
                </div>
                <div className="flex-grow relative">
                    {children}
                </div>
            </div>
        </div>
    );
}