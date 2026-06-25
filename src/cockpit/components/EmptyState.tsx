import { Inbox } from "lucide-react";
import { ReactNode } from "react";

export function EmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-10 w-10 rounded-full bg-[#E8EAF6] text-[#2D3A8C] flex items-center justify-center mb-2">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="text-xs nx-muted max-w-[260px]">{message}</p>
    </div>
  );
}
