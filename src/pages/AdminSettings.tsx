import { Card } from "@/components/ui/card";
import { Settings, Bell, Shield, Database, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Configuración</h1>
        <p className="page-description">
          Ajusta las preferencias del sistema
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* General */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            General
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-logout">Cierre de sesión automático</Label>
                <p className="text-sm text-muted-foreground">
                  Cerrar sesión después de 30 minutos de inactividad
                </p>
              </div>
              <Switch id="auto-logout" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound">Sonidos de notificación</Label>
                <p className="text-sm text-muted-foreground">
                  Reproducir sonido al registrar accesos
                </p>
              </div>
              <Switch id="sound" />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="alert-denied">Alertas de accesos denegados</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificación cuando se deniegue un acceso
                </p>
              </div>
              <Switch id="alert-denied" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="alert-blacklist">Alertas de lista negra</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar cuando alguien de la lista negra intente ingresar
                </p>
              </div>
              <Switch id="alert-blacklist" defaultChecked />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Seguridad
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="2fa">Autenticación de dos factores</Label>
                <p className="text-sm text-muted-foreground">
                  Requiere código adicional al iniciar sesión
                </p>
              </div>
              <Switch id="2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="log-all">Registrar todas las acciones</Label>
                <p className="text-sm text-muted-foreground">
                  Guardar historial completo de actividades
                </p>
              </div>
              <Switch id="log-all" defaultChecked />
            </div>
          </div>
        </Card>

        {/* System Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Sistema
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versión</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base de datos</span>
              <span className="font-medium text-success">Conectada</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última sincronización</span>
              <span className="font-medium">Hace 2 minutos</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>Guardar Cambios</Button>
      </div>
    </div>
  );
}
