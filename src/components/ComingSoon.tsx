import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Construction className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Próximamente</h2>
          <p className="text-muted-foreground max-w-md">
            Esta funcionalidad estará disponible en una próxima actualización.
            Estamos trabajando para ofrecerte la mejor experiencia.
          </p>
        </div>
      </Card>
    </div>
  );
}
