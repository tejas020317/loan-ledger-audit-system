const fs = require('fs');

const sidebar = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, DollarSign, PiggyBank, FileBarChart, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/loans", label: "Loans", icon: CreditCard },
  { href: "/payments", label: "Loan Payments", icon: DollarSign },
  { href: "/fd", label: "Fixed Deposits", icon: PiggyBank },
  { href: "/fd-deposits", label: "FD Deposits", icon: DollarSign },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export default function Sidebar({ isOpen, onClose, isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className={"fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"}
          onClick={onClose}
        />
      )}

      <aside
        className={\`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/60 backdrop-blur-xl shadow-lg md:shadow-none transition-all duration-300 ease-in-out md:static md:translate-x-0 \${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } \${isCollapsed ? "w-[70px]" : "w-64"} flex-shrink-0\`}
      >
        {/* Logo Section */}
        <div className={\`flex items-center \${isCollapsed ? 'justify-center' : 'justify-between'} px-6 py-5 h-16 shrink-0\`}>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight text-foreground">
                  BankLoan
                </div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
          )}
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="h-px bg-border/60" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1.5 p-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(\`\${item.href}/\`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) onClose();
                }}
                className={\`flex items-center rounded-lg transition-all duration-200 group relative \${
                  isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                } text-sm font-medium \${
                  active
                    ? "bg-accent/50 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }\`}
                title={isCollapsed ? item.label : undefined}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
                
                <Icon
                  className={\`shrink-0 \${isCollapsed ? "h-[22px] w-[22px]" : "h-[18px] w-[18px]"} \${
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  } transition-colors\`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout */}
        <div className="p-4 border-t border-border md:hidden shrink-0">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}`;

fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

const topnav = `"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Menu, PanelLeftClose, PanelLeft, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface TopnavProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export default function Topnav({ onMenuClick, onToggleCollapse, isCollapsed }: TopnavProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const currentTheme = theme === "system" ? "light" : theme;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/60 backdrop-blur-xl px-4 md:px-6 shrink-0 transition-colors">
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
        <button
          onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-foreground hover:bg-muted transition-all"
        >
          {currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-foreground hover:bg-muted transition-all">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-border h-8">
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
}`;

fs.writeFileSync('src/components/Topnav.tsx', topnav);

const dashboard = `"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardApi, DashboardStats, DashboardCharts } from "@/lib/api";
import {
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Users, CreditCard, PiggyBank, CircleDollarSign, ArrowRight, Activity } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
  href?: string;
}

function StatCard({ label, value, icon, accent, sub, href }: StatCardProps) {
  const inner = (
    <div className="card group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: accent + "10", borderColor: accent + "30", color: accent }}>
           {icon}
        </div>
        {href && <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
      <div>
        <div className="text-[2rem] font-bold tracking-tight text-foreground leading-tight">{value}</div>
        <div className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
           {label}
        </div>
        {sub && <div className="text-xs text-muted-foreground/70 mt-2">{sub}</div>}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getCharts()
    ])
      .then(([statsRes, chartsRes]) => {
        setStats(statsRes.data);
        setCharts(chartsRes.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  const fmtCurrency = (n: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 pb-10">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your banking platform today.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-card/50 border border-border backdrop-blur-sm rounded-lg shadow-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span>{new Date().toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Customers" value={fmt(stats.total_customers)} icon={<Users className="h-5 w-5"/>} accent="#3b82f6" href="/customers" />
            <StatCard label="Active Loans" value={fmt(stats.active_loans)} icon={<CreditCard className="h-5 w-5"/>} accent="#8b5cf6" href="/loans" />
            <StatCard label="FD Accounts" value={fmt(stats.total_fd_accounts)} icon={<PiggyBank className="h-5 w-5"/>} accent="#10b981" href="/fd" />
            <StatCard label="Outstanding" value={fmtCurrency(stats.total_outstanding_loans)} icon={<CircleDollarSign className="h-5 w-5"/>} accent="#f59e0b" />
            <StatCard label="Today's Payments" value={fmt(stats.payments_today)} icon={<Activity className="h-5 w-5"/>} accent="#06b6d4" href="/payments" />
          </div>

          {charts && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="card lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">Loan Balance Trend</h3>
                    <p className="text-sm text-muted-foreground mt-1">Total outstanding balance over the last 6 months</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLoan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="currentColor" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => \`₹\${(v / 1000).toFixed(0)}k\`} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
                        formatter={(v: any) => fmtCurrency(Number(v))} 
                      />
                      <Area type="monotone" dataKey="loanBalance" name="Balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoan)" activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="mb-6">
                  <h3 className="text-base font-semibold tracking-tight">Interest vs Principal</h3>
                  <p className="text-sm text-muted-foreground mt-1">Breakdown of total recovered funds</p>
                </div>
                <div className="h-[250px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.interestVsPrincipal}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {charts.interestVsPrincipal.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={entry.name === "Principal" ? "#3b82f6" : "#f59e0b"} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
                        formatter={(v: any) => fmtCurrency(Number(v))} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                    <span className="text-lg font-bold text-foreground">
                      {fmtCurrency(charts.interestVsPrincipal.reduce((acc, curr) => acc + curr.value, 0))}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {charts.interestVsPrincipal.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.name === "Principal" ? "#3b82f6" : "#f59e0b" }} />
                        <span className="font-medium text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-semibold">{fmtCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}`;

fs.writeFileSync('src/app/(app)/dashboard/page.tsx', dashboard);

console.log("Patched component files");
