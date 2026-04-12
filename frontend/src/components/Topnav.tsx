"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Menu, PanelLeftClose, PanelLeft, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

interface TopnavProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export default function Topnav({ onMenuClick, onToggleCollapse, isCollapsed }: TopnavProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const currentTheme = theme === "system" ? "light" : theme;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 dark:border-white/5 bg-white/70 dark:bg-black/20 backdrop-blur-xl px-4 md:px-6 shrink-0 transition-colors">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground md:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft className="h-[20px] w-[20px]" /> : <PanelLeftClose className="h-[20px] w-[20px]" />}
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {mounted && (
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 dark:border-white/5 bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-all"
          >
            {currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}

        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 dark:border-white/5 bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-all">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-border/40 dark:border-white/5 h-8">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold tracking-tight text-foreground leading-none">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-muted-foreground capitalize mt-1">{user?.role || "Officer"}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
             <span className="text-xs font-bold text-primary">AD</span>
          </div>
          
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}