import { Navbar } from "@/components/nav-bar";
import SidebarLayout from "@/components/sidebar-layout";

export default function Page ({ children } : { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <SidebarLayout projectId="123">
          {children}
        </SidebarLayout>  
      </div>
    </div>
  );
}