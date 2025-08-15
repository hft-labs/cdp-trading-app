'use client'
import { redirect } from "next/navigation";

export default function Dashboard() {
    redirect("/portfolio");
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
}