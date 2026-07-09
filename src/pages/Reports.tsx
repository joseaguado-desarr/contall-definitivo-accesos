import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const reportTypes = [
  {
    id: "daily",
    title: "Reporte Diario",
    description: "Resumen de accesos del día actual",
    icon: Calendar,
  },
  {
    id: "weekly",
    title: "Reporte Semanal",
    description: "Estadísticas de la última semana",
    icon: Calendar,
  },
  {
    id: "visitors",
    title: "Reporte de Visitantes",
    description: "Listado completo de visitantes",
    icon: FileText,
  },
  {
    id: "denied",
    title: "Accesos Denegados",
    description: "Registro de intentos fallidos",
    icon: FileText,
  },
];

const methodLabels: Record<string, string> = {
  facial: "Facial",
  qr: "Código QR",
  manual: "Manual",
  card: "Tarjeta",
};

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<string>("pdf");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split("T")[0]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const fetchReportData = async () => {
    const today = new Date().toISOString().split("T")[0];

    if (selectedReport === "daily") {
      const from = dateFrom || today;
      const to = dateTo || today;
      return await apiClient.get(`/access?from=${from}&to=${to}`);
    }

    if (selectedReport === "weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const from = dateFrom || weekAgo.toISOString().split("T")[0];
      const to = dateTo || today;
      return await apiClient.get(`/access?from=${from}&to=${to}`);
    }

    if (selectedReport === "visitors") {
      // Current visits API doesn't support date filtering, but we can filter in memory or add parameters
      return await apiClient.get("/visits");
    }

    if (selectedReport === "denied") {
      const from = dateFrom || today;
      const to = dateTo || today;
      const data = await apiClient.get(`/access?from=${from}&to=${to}`);
      return data.filter((log: any) => log.result === 'denied');
    }

    return [];
  };

  const generatePDF = async (data: any[]) => {
    const doc = new jsPDF();
    const reportLabel = reportTypes.find((r) => r.id === selectedReport)?.title || "Reporte";
    const now = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Sistema de Control de Accesos", 14, 12);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(reportLabel, 14, 21);

    // Meta
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Generado: ${now}`, 14, 35);
    if (dateFrom || dateTo) {
      doc.text(`Período: ${dateFrom || "inicio"} al ${dateTo || "hoy"}`, 14, 41);
    }
    doc.text(`Total de registros: ${data.length}`, 14, dateFrom || dateTo ? 47 : 41);

    // Table
    const startY = dateFrom || dateTo ? 53 : 47;

    if (selectedReport === "visitors") {
      autoTable(doc, {
        startY,
        head: [["Nombre", "Documento", "Teléfono", "Anfitrión", "Motivo", "Entrada", "Estado"]],
        body: data.map((v: any) => [
          v.visitor_name || "",
          v.visitor_document || "",
          v.visitor_phone || "—",
          v.host_name || "—",
          v.reason || "—",
          v.entry_time ? format(new Date(v.entry_time), "dd/MM/yyyy HH:mm") : "",
          v.status === "inside" ? "Dentro" : v.status === "exited" ? "Salió" : v.status,
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [30, 58, 138], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 255] },
      });
    } else {
      autoTable(doc, {
        startY,
        head: [["Persona", "Dirección", "Método", "Resultado", "Fecha y Hora"]],
        body: data.map((log: any) => {
          const name = log.persons
            ? `${log.persons.first_name} ${log.persons.last_name}`
            : log.visits?.visitor_name || "Desconocido";
          return [
            name,
            log.direction === "entry" ? "Entrada" : "Salida",
            methodLabels[log.method] || log.method,
            log.result === "authorized" ? "Autorizado" : log.result === "denied" ? "Denegado" : "Pendiente",
            log.created_at ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm") : "",
          ];
        }),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [30, 58, 138], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        columnStyles: {
          2: { halign: "center" },
          3: { halign: "center" },
        },
      });
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} — Sistema de Control de Accesos`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    doc.save(`${selectedReport}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
  };

  const generateCSV = (data: any[]) => {
    let csv = "";

    if (selectedReport === "visitors") {
      csv = "Nombre,Documento,Teléfono,Anfitrión,Motivo,Estado,Entrada\n";
      data.forEach((v: any) => {
        csv += `"${v.visitor_name || ""}","${v.visitor_document || ""}","${v.visitor_phone || ""}","${v.host_name || ""}","${v.reason || ""}","${v.status || ""}","${v.entry_time ? format(new Date(v.entry_time), "dd/MM/yyyy HH:mm") : ""}"\n`;
      });
    } else {
      csv = "Persona,Dirección,Método,Resultado,Fecha\n";
      data.forEach((log: any) => {
        const name = log.persons
          ? `${log.persons.first_name} ${log.persons.last_name}`
          : log.visits?.visitor_name || "Desconocido";
        csv += `"${name}","${log.direction === "entry" ? "Entrada" : "Salida"}","${methodLabels[log.method] || log.method}","${log.result}","${log.created_at ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm") : ""}"\n`;
      });
    }

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!selectedReport) return;
    setGenerating(true);
    try {
      const data = await fetchReportData();
      if (data.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay registros en el período seleccionado",
        });
        return;
      }
      if (outputFormat === "pdf") {
        await generatePDF(data);
      } else {
        generateCSV(data);
      }
      toast({
        title: "Reporte generado",
        description: `Se descargó el reporte con ${data.length} registros`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el reporte",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Reportes</h1>
        <p className="page-description">Genera y exporta reportes del sistema</p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`p-5 cursor-pointer transition-all hover:shadow-md ${
              selectedReport === report.id ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <report.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Export Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Opciones de Exportación
        </h3>
        <div className="flex flex-col gap-4">
          {/* Date range */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
              />
            </div>
          </div>

          {/* Format + Generate */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Formato de salida</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                disabled={!selectedReport || generating}
                onClick={handleGenerate}
                className="w-full sm:w-auto gap-2"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {generating ? "Generando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {/* Historical Stored Reports */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Reportes Históricos (Autogenerados)
        </h3>
        <HistoricalReports />
      </Card>
    </div>
  );
}

function HistoricalReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const data = await apiClient.get("/reports");
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching historical reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = (filename: string) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports/download/${filename}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (reports.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No hay reportes guardados aún.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
              {report.filename}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDownload(report.filename)}
            title="Descargar"
          >
            <Download className="w-4 h-4 text-primary" />
          </Button>
        </div>
      ))}
    </div>
  );
}
