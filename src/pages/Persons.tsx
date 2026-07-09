import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Users,
  UserPlus,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  document: string;
  type: "resident" | "employee" | "contractor";
  status: "active" | "inactive" | "suspended";
  phone: string | null;
  email: string | null;
  unit: string | null;
  notes: string | null;
  created_at: string;
}

const personTypeLabels = {
  resident: "Residente",
  employee: "Empleado",
  contractor: "Contratista",
};

const statusLabels = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
};

export default function Persons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    document: "",
    type: "resident" as "resident" | "employee" | "contractor",
    status: "active" as "active" | "inactive" | "suspended",
    phone: "",
    email: "",
    unit: "",
    notes: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchPersons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPersons = async () => {
    try {
      const data = await apiClient.get("/persons");
      setPersons(data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las personas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (person?: Person) => {
    if (person) {
      setSelectedPerson(person);
      setFormData({
        first_name: person.first_name,
        last_name: person.last_name,
        document: person.document,
        type: person.type,
        status: person.status,
        phone: person.phone || "",
        email: person.email || "",
        unit: person.unit || "",
        notes: person.notes || "",
      });
    } else {
      setSelectedPerson(null);
      setFormData({
        first_name: "",
        last_name: "",
        document: "",
        type: "resident",
        status: "active",
        phone: "",
        email: "",
        unit: "",
        notes: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPerson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        document: formData.document.trim(),
        type: formData.type,
        status: formData.status,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        unit: formData.unit.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (selectedPerson) {
        await apiClient.put(`/persons/${selectedPerson.id}`, payload);
        toast({ title: "Persona actualizada correctamente" });
      } else {
        await apiClient.post("/persons", payload);
        toast({ title: "Persona registrada correctamente" });
      }

      handleCloseForm();
      fetchPersons();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la persona",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;

    try {
      await apiClient.delete(`/persons/${selectedPerson.id}`);
      toast({ title: "Persona eliminada correctamente" });
      setIsDeleteOpen(false);
      setSelectedPerson(null);
      fetchPersons();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la persona",
      });
    }
  };

  const filteredPersons = persons.filter((person) => {
    const matchesSearch =
      person.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.document.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || person.type === filterType;
    const matchesStatus = filterStatus === "all" || person.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Personas</h1>
          <p className="page-description">
            Gestiona residentes, empleados y contratistas
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Nueva Persona
        </Button>
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
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="resident">Residente</SelectItem>
                <SelectItem value="employee">Empleado</SelectItem>
                <SelectItem value="contractor">Contratista</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
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
        ) : filteredPersons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No hay personas</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? "No se encontraron resultados" : "Registra la primera persona"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenForm()} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Persona
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{person.first_name} {person.last_name}</p>
                        {person.email && (
                          <p className="text-xs text-muted-foreground">{person.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{person.document}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {personTypeLabels[person.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{person.unit || "-"}</TableCell>
                    <TableCell>
                      <span className={`status-badge status-${person.status}`}>
                        {statusLabels[person.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(person)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPerson(person);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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
            <DialogTitle>
              {selectedPerson ? "Editar Persona" : "Nueva Persona"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document">Documento *</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "resident" | "employee" | "contractor") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Residente</SelectItem>
                    <SelectItem value="employee">Empleado</SelectItem>
                    <SelectItem value="contractor">Contratista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidad</Label>
                <Input
                  id="unit"
                  placeholder="Ej: Apto 301"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "suspended") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedPerson ? "Guardar Cambios" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar persona?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{" "}
              <strong>{selectedPerson?.first_name} {selectedPerson?.last_name}</strong>{" "}
              del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
