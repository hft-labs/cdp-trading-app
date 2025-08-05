import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import SidebarLayout from "@/components/sidebar-layout";

export default function Loading() {
    return (
        <SidebarLayout>
        <div className="flex flex-row w-full h-full px-8 gap-8 bg-black">
            <div className="basis-2/3">
                {/* Portfolio Overview */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    
                    {/* Portfolio Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-6 rounded-lg border border-gray-800 space-y-3">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                    
                    {/* Top Assets Table */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="rounded-lg border border-gray-800 overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-900/50 border-b border-gray-800">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            
                            {/* Table Rows */}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-800 last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="basis-1/3">
                {/* Swap Widget Loading */}
                <div className="p-6 rounded-lg border border-gray-800 space-y-4">
                    <Skeleton className="h-6 w-24" />
                    
                    {/* Token Input Sections */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-700">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-20" />
                                </div>
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-700">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-20" />
                                </div>
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Swap Button */}
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                
                <Separator className="my-4" />
                
                {/* Wallet Controls Loading */}
                <div className="space-y-4">
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-800">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </SidebarLayout>
    );
}
