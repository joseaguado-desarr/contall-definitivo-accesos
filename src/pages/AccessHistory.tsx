import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  History as HistoryIcon,
  Filter,
  Calendar,
  LogIn,
  LogOut,
  Shield,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AccessLog {
  id: string;
  person_id: string | null;
  visit_id: string | null;
  method: "facial" | "qr" | "manual" | "card";
  result: "authorized" | "denied" | "pending";
  direction: string;
  notes: string | null;
  created_at: string;
  first_name?: string;
  last_name?: string;
  visitor_name?: string;
}

const methodLabels: Record<string, string> = {
  facial: "Facial",
  qr: "Código QR",
  manual: "Manual",
  card: "Tarjeta",
};

const resultLabels: Record<string, string> = {
  authorized: "Autorizado",
  denied: "Denegado",
  pending: "Pendiente",
};

export default function AccessHistory() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");

  // Date range filters
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>(today);

  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let queryParams = "";
      if (dateFrom || dateTo) {
        queryParams = `?from=${dateFrom || ""}&to=${dateTo || ""}`;
      }

      const data = await apiClient.get(`/access${queryParams}`);
      setLogs(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el historial",
      });
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const personName = (log.first_name || log.last_name)
      ? `${log.first_name || ''} ${log.last_name || ''}`.trim()
      : log.visitor_name || "";

    const matchesSearch = personName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResult = filterResult === "all" || log.result === filterResult;
    const matchesMethod = filterMethod === "all" || log.method === filterMethod;

    return matchesSearch && matchesResult && matchesMethod;
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayAuthorized = logs.filter(
    (log) => new Date(log.created_at) >= todayStart && log.result === "authorized"
  ).length;

  const todayDenied = logs.filter(
    (log) => new Date(log.created_at) >= todayStart && log.result === "denied"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Historial de Accesos</h1>
            <p className="page-description">Registro completo de entradas y salidas</p>
          </div>
          <Button variant="outline" onClick={fetchLogs} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{todayAuthorized}</p>
            <p className="text-xs text-muted-foreground">Autorizados Hoy</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{todayDenied}</p>
            <p className="text-xs text-muted-foreground">Denegados Hoy</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{filteredLogs.length}</p>
            <p className="text-xs text-muted-foreground">Registros Filtrados</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Total en Rango</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Date + Result + Method filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm text-muted-foreground">Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
              />
            </div>
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="authorized">Autorizado</SelectItem>
                <SelectItem value="denied">Denegado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="qr">QR</SelectItem>
                <SelectItem value="facial">Facial</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HistoryIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Sin registros</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? "No se encontraron resultados" : "No hay accesos en el rango seleccionado"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const personName = log.persons
                    ? `${log.persons.first_name} ${log.persons.last_name}`
                    : log.visits?.visitor_name || "Desconocido";

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <p className="font-medium">{personName}</p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          {log.direction === "entry" ? (
                            <>
                              <LogIn className="w-4 h-4 text-success" />
                              <span>Entrada</span>
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 text-muted-foreground" />
                              <span>Salida</span>
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {methodLabels[log.method] || log.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`status-badge status-${log.result}`}>
                          {resultLabels[log.result] || log.result}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {log.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
