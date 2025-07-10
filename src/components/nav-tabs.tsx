"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavTabsProps {
  tabs: Array<{
    title: string;
    href: string;
  }>;
}

export function NavTabs({ tabs }: NavTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4">
      {tabs.map((tab) => {
        const isActive = true
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "text-gray-900 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-ds-blue-500"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tab.title}
          </Link>
        );
      })}
    </nav>
  );
} 