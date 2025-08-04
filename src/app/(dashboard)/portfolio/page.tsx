import SidebarLayout from "@/components/sidebar-layout";
import { PageClient } from "./page-client";

export default async function Home() {
    return (
        <SidebarLayout>
            <PageClient />
        </SidebarLayout>
    );
}