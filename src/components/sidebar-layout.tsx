'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserButton } from "@stackframe/stack";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Typography } from "@/components/ui/typography";
import { buttonVariants } from "@/components/ui/button";
import {
    Book,
    Globe,
    KeyRound,
    ArrowDownUp,
    Link as LinkIcon,
    LockKeyhole,
    LucideIcon,
    Mail,
    Menu,
    Palette,
    Settings,
    Settings2,
    ShieldEllipsis,
    SquarePen,
    User,
    Users,
    Webhook,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Wallet } from './wallet'
import { Wallet as WalletIcon } from "lucide-react";

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
        name: "Swap",
        href: "/swap",
        regex: /^\/swap\/?$/,
        icon: ArrowDownUp,
        type: 'item'
    },
    {
        name: "Portfolio",
        href: "/",
        regex: /^\/projects\/[^\/]+\/?$/,
        icon: WalletIcon,
        type: 'item'
    },
   
    {
        name: (pathname: string) => {
            const match = pathname.match(/^\/projects\/[^\/]+\/webhooks\/([^\/]+)$/);
            let href;
            if (match) {
                href = `/teams/${match[1]}`;
            } else {
                href = "";
            }

            return [
                { item: "Webhooks", href: "/webhooks" },
                { item: "Endpoint", href },
            ];
        },
        regex: /^\/projects\/[^\/]+\/webhooks\/[^\/]+$/,
        type: 'hidden',
    },
    {
        name: "Stack Auth Keys",
        href: "/api-keys",
        regex: /^\/projects\/[^\/]+\/api-keys$/,
        icon: KeyRound,
        type: 'item'
    },
    {
        name: "Project Settings",
        href: "/project-settings",
        regex: /^\/projects\/[^\/]+\/project-settings$/,
        icon: Settings,
        type: 'item'
    }
];

function NavItem({ item, href, onClick }: { item: Item, href: string, onClick?: () => void }) {
    const pathname = usePathname();
    const selected = useMemo(() => {
        let pathnameWithoutTrailingSlash = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
        return item.regex.test(pathnameWithoutTrailingSlash);
    }, [item.regex, pathname]);

    return (
        <Link
            href={href}
            className={cn(
                buttonVariants({ variant: 'ghost', size: "sm" }),
                "flex-grow justify-start text-md text-zinc-800 dark:text-zinc-300 px-2",
                selected && "bg-muted",
            )}
            onClick={onClick}
            prefetch={true}
        >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
        </Link>
    );
}

function SidebarContent({ projectId, onNavigate }: { projectId: string, onNavigate?: () => void }) {
    return (
        <div className="flex flex-col h-full items-stretch">
            <div className="h-14 border-b flex items-center px-2 shrink-0">
                <div className="flex-grow mx-2">
                    BYOC
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
                            <NavItem item={item} onClick={onNavigate} href={`/projects/${projectId}${item.href}`} />
                        </div>;
                    }
                })}

                <div className="flex-grow" />

                <div className="py-2 px-2 flex">
                    <NavItem
                        onClick={onNavigate}
                        item={{
                            name: "Documentation",
                            type: "item",
                            href: "",
                            icon: Book,
                            regex: /^$/,
                        }}
                        href={"https://docs.stack-auth.com/"}
                    />
                </div>
            </div>
        </div>
    );
}


export default function SidebarLayout(props: { projectId: string, children?: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <div className="w-full flex">
            <div className="flex-col border-r min-w-[240px] h-screen sticky top-0 hidden md:flex backdrop-blur-md bg-white/20 dark:bg-black/20 z-[10]">
                <SidebarContent projectId={props.projectId} />
            </div>
            <div className="flex flex-col flex-grow w-0">
                <div className="h-14 border-b flex items-center justify-between sticky top-0 backdrop-blur-md bg-white/20 dark:bg-black/20 z-10 px-4 md:px-6">
                    <div className="hidden md:flex">
                    </div>

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
                                side='left' className="w-[240px] p-0" hasCloseButton={false}>
                                <SidebarContent projectId={props.projectId} onNavigate={() => setSidebarOpen(false)} />
                            </SheetContent>
                        </Sheet>

                        <div className="ml-4 flex md:hidden">
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Wallet />
                        <UserButton
                            colorModeToggle={() =>
                                setTheme(resolvedTheme === "light" ? "dark" : "light")
                            }
                        />
                    </div>
                </div>
                <div className="flex-grow relative">
                    {props.children}
                </div>
            </div>
        </div>
    );
}