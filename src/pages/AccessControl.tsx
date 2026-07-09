import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Shield, QrCode, Fingerprint, Camera, CreditCard, CheckCircle, XCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type ActivePanel = "facial" | "fingerprint" | "cedula" | "manual" | null;

interface PersonResult {
  id: string;
  first_name: string;
  last_name: string;
  document: string;
  type: string;
  status: string;
  unit: string | null;
  photo_url: string | null;
}

const typeLabels: Record<string, string> = {
  resident: "Residente",
  employee: "Empleado",
  contractor: "Contratista",
};

export default function AccessControl() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // Facial
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facialSearch, setFacialSearch] = useState("");

  // Cedula / Fingerprint
  const cedulaInputRef = useRef<HTMLInputElement>(null);
  const fingerprintInputRef = useRef<HTMLInputElement>(null);
  const [cedulaValue, setCedulaValue] = useState("");
  const [fingerprintValue, setFingerprintValue] = useState("");

  // Manual
  const [manualSearch, setManualSearch] = useState("");

  // Shared result
  const [foundPerson, setFoundPerson] = useState<PersonResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [accessResult, setAccessResult] = useState<"authorized" | "denied" | null>(null);

  const { toast } = useToast();

  // Stop camera on panel change
  useEffect(() => {
    if (activePanel !== "facial" && cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setFoundPerson(null);
    setAccessResult(null);
    setFacialSearch("");
    setCedulaValue("");
    setFingerprintValue("");
    setManualSearch("");
    setCameraError(null);
  }, [activePanel]);

  // Focus cedula input when panel opens
  useEffect(() => {
    if (activePanel === "cedula") {
      setTimeout(() => cedulaInputRef.current?.focus(), 100);
    }
    if (activePanel === "fingerprint") {
      setTimeout(() => fingerprintInputRef.current?.focus(), 100);
    }
  }, [activePanel]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
    }
  };

  const searchPerson = useCallback(async (documentOrName: string, field: "document" | "name" = "document") => {
    if (!documentOrName.trim()) return;
    setSearching(true);
    setFoundPerson(null);
    setAccessResult(null);
    try {
      const queryParams = field === "document" ? `?document=${documentOrName}` : `?name=${documentOrName}`;
      const data = await apiClient.get(`/persons${queryParams}`);
      
      if (!data || data.length === 0) {
        setFoundPerson(null);
        toast({ title: "No encontrado", description: "No se encontró ninguna persona" });
      } else {
        setFoundPerson(data[0] as PersonResult);
      }
    } catch {
      setFoundPerson(null);
    } finally {
      setSearching(false);
    }
  }, [toast]);

  const registerAccess = async (result: "authorized" | "denied", method: "facial" | "qr" | "manual" | "card") => {
    try {
      await apiClient.post("/access", {
        person_id: foundPerson?.id || null,
        method,
        result,
        direction: "entry",
        notes: foundPerson ? `Acceso ${result === "authorized" ? "autorizado" : "denegado"} vía ${method}` : "Persona no registrada",
      });
      setAccessResult(result);
      toast({
        title: result === "authorized" ? "✅ Acceso Autorizado" : "❌ Acceso Denegado",
        description: foundPerson ? `${foundPerson.first_name} ${foundPerson.last_name}` : "Persona no identificada",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo registrar el acceso" });
    }
  };

  // Panel component for showing found person
  const PersonCard = ({ method }: { method: "facial" | "qr" | "manual" | "card" }) => {
    if (!foundPerson && !accessResult) return null;
    if (accessResult) {
      return (
        <div className={`mt-4 p-4 rounded-xl flex items-center gap-4 ${accessResult === "authorized" ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
          {accessResult === "authorized" ? (
            <CheckCircle className="w-10 h-10 text-success" />
          ) : (
            <XCircle className="w-10 h-10 text-destructive" />
          )}
          <div>
            <p className="font-semibold text-lg">{accessResult === "authorized" ? "Acceso Autorizado" : "Acceso Denegado"}</p>
            {foundPerson && <p className="text-sm text-muted-foreground">{foundPerson.first_name} {foundPerson.last_name}</p>}
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => { setFoundPerson(null); setAccessResult(null); }}>
            Nuevo
          </Button>
        </div>
      );
    }
    if (!foundPerson) return null;
    return (
      <div className="mt-4 p-4 rounded-xl bg-muted/50 border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {foundPerson.first_name.charAt(0)}{foundPerson.last_name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-lg">{foundPerson.first_name} {foundPerson.last_name}</p>
            <p className="text-sm text-muted-foreground">Cédula: {foundPerson.document}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{typeLabels[foundPerson.type] || foundPerson.type}</Badge>
              <Badge variant={foundPerson.status === "active" ? "default" : "destructive"}>
                {foundPerson.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
              {foundPerson.unit && <Badge variant="outline">Unidad {foundPerson.unit}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1 gap-2 bg-success hover:bg-success/90"
            onClick={() => registerAccess("authorized", method)}
            disabled={foundPerson.status !== "active"}
          >
            <CheckCircle className="w-4 h-4" />
            Autorizar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={() => registerAccess("denied", method)}
          >
            <XCircle className="w-4 h-4" />
            Denegar
          </Button>
        </div>
        {foundPerson.status !== "active" && (
          <p className="text-xs text-destructive mt-2">⚠ Esta persona no está activa en el sistema.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Control de Acceso</h1>
        <p className="page-description">Verificación de identidad y autorización de accesos</p>
      </div>

      {/* Access Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Facial */}
        <Card
          className={`p-6 hover:shadow-lg transition-all cursor-pointer group ${activePanel === "facial" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setActivePanel(activePanel === "facial" ? null : "facial")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${activePanel === "facial" ? "bg-primary/20" : "bg-primary/10 group-hover:bg-primary/20"}`}>
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Reconocimiento Facial</h3>
            <p className="text-sm text-muted-foreground mb-4">Verifica la identidad mediante cámara</p>
            <Button variant={activePanel === "facial" ? "default" : "outline"} className="w-full">
              {activePanel === "facial" ? "Cerrar Panel" : "Iniciar Escaneo"}
            </Button>
          </div>
        </Card>

        {/* Fingerprint */}
        <Card
          className={`p-6 hover:shadow-lg transition-all cursor-pointer group ${activePanel === "fingerprint" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setActivePanel(activePanel === "fingerprint" ? null : "fingerprint")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${activePanel === "fingerprint" ? "bg-success/20" : "bg-success/10 group-hover:bg-success/20"}`}>
              <Fingerprint className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Huella Digital</h3>
            <p className="text-sm text-muted-foreground mb-4">Lector biométrico de huella digital</p>
            <Button variant={activePanel === "fingerprint" ? "default" : "outline"} className="w-full">
              {activePanel === "fingerprint" ? "Cerrar Panel" : "Leer Huella"}
            </Button>
          </div>
        </Card>

        {/* Cedula Reader */}
        <Card
          className={`p-6 hover:shadow-lg transition-all cursor-pointer group ${activePanel === "cedula" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setActivePanel(activePanel === "cedula" ? null : "cedula")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${activePanel === "cedula" ? "bg-info/20" : "bg-info/10 group-hover:bg-info/20"}`}>
              <CreditCard className="w-8 h-8 text-info" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Lector de Cédula</h3>
            <p className="text-sm text-muted-foreground mb-4">Cédulas nuevas y antiguas (USB)</p>
            <Button variant={activePanel === "cedula" ? "default" : "outline"} className="w-full">
              {activePanel === "cedula" ? "Cerrar Panel" : "Leer Cédula"}
            </Button>
          </div>
        </Card>

        {/* Manual */}
        <Card
          className={`p-6 hover:shadow-lg transition-all cursor-pointer group ${activePanel === "manual" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setActivePanel(activePanel === "manual" ? null : "manual")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${activePanel === "manual" ? "bg-warning/20" : "bg-warning/10 group-hover:bg-warning/20"}`}>
              <Shield className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Acceso Manual</h3>
            <p className="text-sm text-muted-foreground mb-4">Búsqueda por nombre o documento</p>
            <Button variant={activePanel === "manual" ? "default" : "outline"} className="w-full">
              {activePanel === "manual" ? "Cerrar Panel" : "Verificar Documento"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Panel */}
      {activePanel && (
        <Card className="p-6">
          {/* ───── FACIAL PANEL ───── */}
          {activePanel === "facial" && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Reconocimiento Facial
              </h3>
              {!cameraStream ? (
                <div className="bg-muted/50 rounded-xl h-[250px] flex flex-col items-center justify-center gap-4">
                  <Camera className="w-16 h-16 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">Se solicitará permiso de cámara</p>
                  <Button onClick={startCamera} className="gap-2">
                    <Camera className="w-4 h-4" />
                    Iniciar Cámara
                  </Button>
                  {cameraError && <p className="text-xs text-destructive mt-2">{cameraError}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black" style={{ maxHeight: 300 }}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full object-cover" style={{ maxHeight: 300 }} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-40 border-2 border-primary rounded-full opacity-60" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Ubica el rostro dentro del círculo, luego busca manualmente la persona para autorizar.
                  </p>
                </div>
              )}
              {/* Manual lookup after camera */}
              {cameraStream && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium">Buscar persona por cédula:</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Número de cédula"
                      value={facialSearch}
                      onChange={(e) => setFacialSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchPerson(facialSearch)}
                    />
                    <Button onClick={() => searchPerson(facialSearch)} disabled={searching || !facialSearch}>
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  <PersonCard method="facial" />
                </div>
              )}
            </div>
          )}

          {/* ───── FINGERPRINT PANEL ───── */}
          {activePanel === "fingerprint" && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-success" />
                Lector de Huella Digital
              </h3>
              <div className="bg-muted/50 rounded-xl p-6 flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center animate-pulse">
                  <Fingerprint className="w-12 h-12 text-success" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Coloca el dedo en el lector. El número de cédula se lee automáticamente.
                </p>
                {/* Hidden input that captures reader data */}
                <input
                  ref={fingerprintInputRef}
                  className="border rounded-md px-3 py-2 text-sm w-full max-w-xs text-center bg-background"
                  placeholder="Esperando lectura del lector..."
                  value={fingerprintValue}
                  onChange={(e) => setFingerprintValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && fingerprintValue.trim()) {
                      searchPerson(fingerprintValue.trim());
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  También puedes escribir el número y presionar Enter
                </p>
                {searching && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
              <PersonCard method="card" />
            </div>
          )}

          {/* ───── CEDULA PANEL ───── */}
          {activePanel === "cedula" && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-info" />
                Lector de Cédula (USB)
              </h3>
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-xl bg-info/10 flex items-center justify-center">
                    <CreditCard className="w-10 h-10 text-info" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Listo para leer cédula</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compatible con cédulas nuevas (10 dígitos) y antiguas (6–8 dígitos).
                      El lector USB envía el número automáticamente como teclado.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    ref={cedulaInputRef}
                    placeholder="Pasa la cédula o escribe el número..."
                    value={cedulaValue}
                    onChange={(e) => {
                      // Accept only digits
                      const val = e.target.value.replace(/\D/g, "");
                      setCedulaValue(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && cedulaValue.trim()) {
                        searchPerson(cedulaValue.trim());
                      }
                    }}
                    maxLength={15}
                    className="font-mono text-center text-lg tracking-widest"
                  />
                  <Button onClick={() => searchPerson(cedulaValue)} disabled={searching || cedulaValue.length < 6}>
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {cedulaValue.length > 0 && (
                    <>Dígitos ingresados: <strong>{cedulaValue.length}</strong> — {cedulaValue.length >= 6 ? "✅ longitud válida" : "⚠ mínimo 6 dígitos"}</>
                  )}
                </p>
              </div>
              <PersonCard method="manual" />
            </div>
          )}

          {/* ───── MANUAL PANEL ───── */}
          {activePanel === "manual" && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-warning" />
                Verificación Manual
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre o número de documento..."
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const isDoc = /^\d+$/.test(manualSearch.trim());
                        searchPerson(manualSearch, isDoc ? "document" : "name");
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const isDoc = /^\d+$/.test(manualSearch.trim());
                      searchPerson(manualSearch, isDoc ? "document" : "name");
                    }}
                    disabled={searching || !manualSearch.trim()}
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Escribe el número de cédula o el nombre de la persona y presiona Enter o el botón de búsqueda.
                </p>
              </div>
              <PersonCard method="manual" />
            </div>
          )}
        </Card>
      )}

      {/* QR placeholder */}
      <Card className="p-6 opacity-60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Código QR</h3>
            <p className="text-sm text-muted-foreground">Requiere lector QR físico conectado al sistema</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
