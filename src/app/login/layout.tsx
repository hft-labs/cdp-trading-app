import { Navbar } from "@/components/nav-bar";

export default function Page({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      {children}
    </div>
  );
}