import NavBar from "@/components/nav-bar";

export default function Page ({ children } : { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}