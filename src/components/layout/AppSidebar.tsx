import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  History,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Clock,
  Ban,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { title: "Personas", icon: Users, href: "/persons" },
      { title: "Visitantes", icon: UserCheck, href: "/visitors" },
      { title: "Control de Acceso", icon: Shield, href: "/access-control" },
    ],
  },
  {
    title: "Registros",
    items: [
      { title: "Historial", icon: History, href: "/history" },
      { title: "Reportes", icon: FileText, href: "/reports" },
    ],
  },
  {
    title: "Administración",
    items: [
      { title: "Usuarios", icon: UserCog, href: "/admin/users" },
      { title: "Horarios", icon: Clock, href: "/admin/schedules" },
      { title: "Lista Negra", icon: Ban, href: "/admin/blacklist" },
      { title: "Configuración", icon: Settings, href: "/admin/settings" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    localStorage.removeItem('auth_token');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate("/login");
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-sidebar transition-all duration-300 ease-in-out border-r border-sidebar-border",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">ContaALL</h1>
              <p className="text-[10px] text-sidebar-muted uppercase tracking-wider">Control de Accesos</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-gradient-accent flex items-center justify-center mx-auto">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navigation.map((group, idx) => (
          <div key={group.title} className={cn("mb-6", idx > 0 && "mt-2")}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const button = (
                  <button
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-sidebar-primary")} />
                    {!collapsed && <span>{item.title}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );

                return (
                  <li key={item.href}>
                    {collapsed ? (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      button
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={10}>
              Cerrar Sesión
            </TooltipContent>
          )}
        </Tooltip>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Contraer</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
