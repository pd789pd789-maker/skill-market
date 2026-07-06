import { AlertTriangle } from "lucide-react";

export function StaleBanner({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
        <p>{message}</p>
      </div>
    </div>
  );
}
