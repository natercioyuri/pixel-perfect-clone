import { Input } from "@/components/ui/input";
import { Search, Zap } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import NotificationBell from "./NotificationBell";

interface DashboardHeaderProps {
  user: User | null;
  search: string;
  onSearchChange: (value: string) => void;
}

const DashboardHeader = ({ user, search, onSearchChange }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 glass border-b border-border px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos, vídeos, lojas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
