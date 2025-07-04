import { SiteLoadingIndicator } from "@/components/site-loading-indicator";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SiteLoadingIndicator />
    </div>
  );
}