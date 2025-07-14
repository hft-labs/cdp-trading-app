"use client";

import { useEffect, useState } from "react";
import { AssetsTable } from "./assets-table";

export default function PortfolioPageClient({ portfolio }: { portfolio: any[] }) {
    const [portfolioState, setPortfolioState] = useState<any[]>([]);
    useEffect(() => {
        setPortfolioState(portfolio);
    }, [portfolio]);    
    console.log('portfolioState', portfolioState);
    return <div>
        <h1>Portfolio</h1>
        <div>
            <AssetsTable positions={portfolioState} />
        </div>
    </div>;    
}