import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Users,
  UserCheck,
  LogIn,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Stats {
  totalPersons: number;
  visitorsToday: number;
  insideNow: number;
  alerts: number;
}

interface RecentActivityItem {
  id: string;
  name: string;
  action: string;
  time: string;
  method: string;
  status: "authorized" | "denied" | "pending";
}

const methodLabels: Record<string, string> = {
  facial: "Facial",
  qr: "QR",
  manual: "Manual",
  card: "Tarjeta",
  fingerprint: "Huella",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPersons: 0,
    visitorsToday: 0,
    insideNow: 0,
    alerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // States for real charts data
  const [accessData, setAccessData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [accessMethodData, setAccessMethodData] = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiClient.get("/dashboard/stats");
      setStats(data);
      
      const chartData = await apiClient.get("/dashboard/charts");
      setAccessData(chartData.hourly || []);
      setWeeklyData(chartData.weekly || []);
      setAccessMethodData(chartData.methods || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const data = await apiClient.get("/dashboard/recent");

      const items: RecentActivityItem[] = (data || []).map((log: any) => {
        const name = (log.first_name || log.last_name)
          ? `${log.first_name || ''} ${log.last_name || ''}`.trim()
          : log.visitor_name || "Desconocido";

        let action = "Acceso";
        if (log.result === "denied") action = "Denegado";
        else if (log.direction === "entry") action = "Entrada";
        else if (log.direction === "exit") action = "Salida";

        return {
          id: log.id,
          name,
          action,
          time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es }),
          method: methodLabels[log.method] || log.method,
          status: log.result,
        };
      });

      setRecentActivity(items);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();

    // Note: Real-time with local node would require WebSockets (Socket.io)
    // For now we'll just use manual refresh or a simple interval
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentActivity();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchStats, fetchRecentActivity]);

  const statCards = [
    {
      title: "Total Personas",
      value: stats.totalPersons,
      icon: Users,
      iconClass: "stat-card-icon-primary",
      change: "+12%",
      changeType: "up" as const,
    },
    {
      title: "Visitantes Hoy",
      value: stats.visitorsToday,
      icon: UserCheck,
      iconClass: "stat-card-icon-info",
      change: "+8%",
      changeType: "up" as const,
    },
    {
      title: "Personas Dentro",
      value: stats.insideNow,
      icon: LogIn,
      iconClass: "stat-card-icon-success",
      change: "En tiempo real",
      changeType: "neutral" as const,
    },
    {
      title: "Alertas",
      value: stats.alerts,
      icon: AlertTriangle,
      iconClass: "stat-card-icon-destructive",
      change: stats.alerts > 0 ? "Revisar" : "Sin alertas",
      changeType: stats.alerts > 0 ? "down" : "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Resumen general del sistema de control de accesos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={stat.title} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div className={`stat-card-icon ${stat.iconClass}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium">
                {stat.changeType === "up" && (
                  <>
                    <ArrowUpRight className="w-3 h-3 text-success" />
                    <span className="text-success">{stat.change}</span>
                  </>
                )}
                {stat.changeType === "down" && (
                  <>
                    <ArrowDownRight className="w-3 h-3 text-destructive" />
                    <span className="text-destructive">{stat.change}</span>
                  </>
                )}
                {stat.changeType === "neutral" && (
                  <span className="text-muted-foreground">{stat.change}</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{loading ? "-" : stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Access Flow Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Flujo de Accesos Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accessData}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 70%, 25%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(220, 70%, 25%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 45%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 88%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="entries" name="Entradas" stroke="hsl(142, 76%, 36%)" fill="url(#colorEntries)" strokeWidth={2} />
                  <Area type="monotone" dataKey="exits" name="Salidas" stroke="hsl(220, 70%, 25%)" fill="url(#colorExits)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metodos de acceso */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Métodos de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={accessMethodData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {accessMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {accessMethodData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Accesos por Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 15%, 45%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 88%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="accesses" name="Accesos" fill="hsl(220, 70%, 25%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity – REAL DATA */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Actividad Reciente
              </CardTitle>
              <button
                onClick={fetchRecentActivity}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${activityLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === "authorized"
                            ? "bg-success"
                            : activity.status === "denied"
                            ? "bg-destructive"
                            : "bg-warning"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action} · {activity.method}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
