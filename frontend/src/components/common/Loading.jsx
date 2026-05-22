import { Loader2 } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="loading-page">
      <Loader2 className="spin" size={30} />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="loading-state">
      <Loader2 className="spin" size={28} />
    </div>
  );
}
