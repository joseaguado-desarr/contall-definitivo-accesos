import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Search,
  Loader2,
  UserCheck,
  LogIn,
  LogOut,
  Car,
  Clock,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Visit {
  id: string;
  visitor_name: string;
  visitor_document: string;
  visitor_phone: string | null;
  vehicle_plate: string | null;
  host_id: string | null;
  host_name: string | null;
  reason: string | null;
  entry_time: string;
  exit_time: string | null;
  status: string;
  created_at: string;
}

interface Person {
  id: string;
  first_name: string;
  last_name: string;
}

export default function Visitors() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    visitor_name: "",
    visitor_document: "",
    visitor_phone: "",
    vehicle_plate: "",
    host_id: "",
    host_name: "",
    reason: "",
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchVisits();
    fetchPersons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVisits = async () => {
    try {
      const data = await apiClient.get("/visits");
      setVisits(data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las visitas",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersons = async () => {
    try {
      const data = await apiClient.get("/persons");
      // Filter for active ones (though current API returns all, we can filter here or add a backend query param)
      setPersons(data.filter((p: any) => p.status === 'active') || []);
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };

  const handleOpenForm = () => {
    setFormData({
      visitor_name: "",
      visitor_document: "",
      visitor_phone: "",
      vehicle_plate: "",
      host_id: "",
      host_name: "",
      reason: "",
    });
    setIsFormOpen(true);
  };

  const handleHostChange = (hostId: string) => {
    const selectedHost = persons.find((p) => p.id === hostId);
    setFormData({
      ...formData,
      host_id: hostId,
      host_name: selectedHost ? `${selectedHost.first_name} ${selectedHost.last_name}` : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        visitor_name: formData.visitor_name.trim(),
        visitor_document: formData.visitor_document.trim(),
        visitor_phone: formData.visitor_phone.trim() || null,
        vehicle_plate: formData.vehicle_plate.trim() || null,
        host_id: formData.host_id || null,
        host_name: formData.host_name.trim() || null,
        reason: formData.reason.trim() || null,
        created_by: user?.id || null,
        status: "inside",
      };

      const visit = await apiClient.post("/visits", payload);

      // Log the access linked to this visit
      await apiClient.post("/access", {
        visit_id: visit.id,
        method: "manual",
        result: "authorized",
        direction: "entry",
        notes: `Entrada de visitante: ${formData.visitor_name}`
      });

      toast({ title: "Visitante registrado correctamente" });
      setIsFormOpen(false);
      fetchVisits();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo registrar el visitante",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkExit = async (visitId: string) => {
    try {
      await apiClient.put(`/visits/${visitId}`, {
        exit_time: new Date().toISOString(),
        status: "outside",
      });

      toast({ title: "Salida registrada" });
      fetchVisits();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la salida",
      });
    }
  };

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.visitor_document.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || visit.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const insideCount = visits.filter((v) => v.status === "inside").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Visitantes</h1>
          <p className="page-description">
            Registro y control de visitantes
          </p>
        </div>
        <Button onClick={handleOpenForm} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Visitante
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{insideCount}</p>
            <p className="text-xs text-muted-foreground">Dentro</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{visits.length}</p>
            <p className="text-xs text-muted-foreground">Total Hoy</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="inside">Dentro</SelectItem>
              <SelectItem value="outside">Salió</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCheck className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No hay visitantes</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? "No se encontraron resultados" : "Registra el primer visitante"}
            </p>
            {!searchQuery && (
              <Button onClick={handleOpenForm} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Visitante
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitante</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Visita a</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{visit.visitor_name}</p>
                        {visit.visitor_phone && (
                          <p className="text-xs text-muted-foreground">{visit.visitor_phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{visit.visitor_document}</TableCell>
                    <TableCell>{visit.host_name || "-"}</TableCell>
                    <TableCell>
                      {visit.vehicle_plate ? (
                        <span className="inline-flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {visit.vehicle_plate}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {format(new Date(visit.entry_time), "HH:mm", { locale: es })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`status-badge status-${visit.status}`}>
                        {visit.status === "inside" ? "Dentro" : "Salió"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {visit.status === "inside" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkExit(visit.id)}
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Marcar Salida
                        </Button>
                      )}
                      {visit.status === "outside" && visit.exit_time && (
                        <span className="text-xs text-muted-foreground">
                          Salió: {format(new Date(visit.exit_time), "HH:mm", { locale: es })}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Visitante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="visitor_name">Nombre del visitante *</Label>
                <Input
                  id="visitor_name"
                  value={formData.visitor_name}
                  onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitor_document">Documento *</Label>
                <Input
                  id="visitor_document"
                  value={formData.visitor_document}
                  onChange={(e) => setFormData({ ...formData, visitor_document: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitor_phone">Teléfono</Label>
                <Input
                  id="visitor_phone"
                  value={formData.visitor_phone}
                  onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_plate">Placa del vehículo</Label>
                <Input
                  id="vehicle_plate"
                  placeholder="ABC-123"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host_id">Visita a</Label>
                <Select value={formData.host_id} onValueChange={handleHostChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {persons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de visita</Label>
              <Textarea
                id="reason"
                placeholder="Ej: Entrega de paquete, reunión, etc."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registrar Entrada
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
