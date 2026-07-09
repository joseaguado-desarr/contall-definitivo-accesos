import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building2, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email requerido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('auth_token', response.token);

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      
      // Force a reload or a state update to refresh useAuth
      window.location.href = "/dashboard";
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">

        {/* Background image — semi-transparent so text remains readable */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/contal.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.25,
          }}
        />

        {/* SVG pattern on top */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzBoNnYtNmg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        {/* Text content — always visible */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ContaALL</h1>
              <p className="text-white/70 text-sm">Sistema de Control de Accesos</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Control total de
            <br />
            <span className="text-white/80">accesos y visitantes</span>
          </h2>

          <p className="text-white/70 text-lg max-w-md">
            Gestiona el ingreso y salida de personas en tu conjunto residencial,
            empresa o edificio con seguridad y eficiencia.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/60 text-sm">Monitoreo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-white/60 text-sm">Seguro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* City skyline background – decorative, open SVG */}
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
          viewBox="0 0 800 260"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ opacity: 0.06 }}
        >
          {/* Background buildings layer (far) */}
          <rect x="0"   y="160" width="30"  height="100" fill="currentColor"/>
          <rect x="35"  y="140" width="25"  height="120" fill="currentColor"/>
          <rect x="65"  y="155" width="35"  height="105" fill="currentColor"/>
          <rect x="105" y="130" width="20"  height="130" fill="currentColor"/>
          <rect x="130" y="145" width="40"  height="115" fill="currentColor"/>
          <rect x="175" y="120" width="28"  height="140" fill="currentColor"/>
          <rect x="208" y="150" width="32"  height="110" fill="currentColor"/>
          <rect x="245" y="135" width="22"  height="125" fill="currentColor"/>
          <rect x="272" y="155" width="38"  height="105" fill="currentColor"/>
          <rect x="315" y="125" width="25"  height="135" fill="currentColor"/>
          <rect x="345" y="140" width="30"  height="120" fill="currentColor"/>
          <rect x="380" y="110" width="20"  height="150" fill="currentColor"/>
          <rect x="405" y="145" width="35"  height="115" fill="currentColor"/>
          <rect x="445" y="130" width="28"  height="130" fill="currentColor"/>
          <rect x="478" y="150" width="40"  height="110" fill="currentColor"/>
          <rect x="523" y="120" width="22"  height="140" fill="currentColor"/>
          <rect x="550" y="140" width="30"  height="120" fill="currentColor"/>
          <rect x="585" y="155" width="35"  height="105" fill="currentColor"/>
          <rect x="625" y="130" width="25"  height="130" fill="currentColor"/>
          <rect x="655" y="145" width="38"  height="115" fill="currentColor"/>
          <rect x="698" y="160" width="28"  height="100" fill="currentColor"/>
          <rect x="730" y="135" width="30"  height="125" fill="currentColor"/>
          <rect x="765" y="150" width="35"  height="110" fill="currentColor"/>

          {/* Foreground tall buildings layer */}
          <rect x="10"  y="100" width="45"  height="160" fill="currentColor"/>
          {/* window rows */}
          <rect x="18"  y="108" width="8"   height="6"   fill="white" opacity="0.25"/>
          <rect x="30"  y="108" width="8"   height="6"   fill="white" opacity="0.25"/>
          <rect x="42"  y="108" width="8"   height="6"   fill="white" opacity="0.25"/>
          <rect x="18"  y="120" width="8"   height="6"   fill="white" opacity="0.25"/>
          <rect x="30"  y="120" width="8"   height="6"   fill="white" opacity="0.25"/>
          <rect x="42"  y="120" width="8"   height="6"   fill="white" opacity="0.25"/>

          <rect x="80"  y="70"  width="55"  height="190" fill="currentColor"/>
          <rect x="88"  y="80"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="102" y="80"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="116" y="80"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="88"  y="94"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="102" y="94"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="116" y="94"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="88"  y="108" width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="102" y="108" width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="116" y="108" width="9"   height="6"   fill="white" opacity="0.2"/>

          {/* Antenna on tall building */}
          <rect x="105" y="60"  width="3"   height="12"  fill="currentColor"/>

          <rect x="160" y="85"  width="50"  height="175" fill="currentColor"/>
          <rect x="168" y="95"  width="8"   height="5"   fill="white" opacity="0.2"/>
          <rect x="182" y="95"  width="8"   height="5"   fill="white" opacity="0.2"/>
          <rect x="196" y="95"  width="8"   height="5"   fill="white" opacity="0.2"/>

          <rect x="240" y="55"  width="60"  height="205" fill="currentColor"/>
          <rect x="248" y="65"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="263" y="65"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="278" y="65"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="248" y="80"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="263" y="80"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="278" y="80"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="248" y="95"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="263" y="95"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="278" y="95"  width="10"  height="7"   fill="white" opacity="0.2"/>
          {/* Antenna */}
          <rect x="268" y="42"  width="4"   height="15"  fill="currentColor"/>
          <circle cx="270" cy="40" r="3"  fill="currentColor"/>

          <rect x="330" y="90"  width="48"  height="170" fill="currentColor"/>
          <rect x="400" y="40"  width="65"  height="220" fill="currentColor"/>
          <rect x="408" y="52"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="424" y="52"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="440" y="52"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="408" y="67"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="424" y="67"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="440" y="67"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="408" y="82"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="424" y="82"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="440" y="82"  width="10"  height="7"   fill="white" opacity="0.2"/>
          {/* Antenna */}
          <rect x="430" y="24"  width="4"   height="18"  fill="currentColor"/>
          <circle cx="432" cy="22" r="4"  fill="currentColor"/>

          <rect x="490" y="75"  width="52"  height="185" fill="currentColor"/>
          <rect x="498" y="85"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="512" y="85"  width="9"   height="6"   fill="white" opacity="0.2"/>
          <rect x="526" y="85"  width="9"   height="6"   fill="white" opacity="0.2"/>

          <rect x="570" y="60"  width="58"  height="200" fill="currentColor"/>
          <rect x="578" y="72"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="594" y="72"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="610" y="72"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="578" y="87"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="594" y="87"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="610" y="87"  width="10"  height="7"   fill="white" opacity="0.2"/>
          {/* Antenna */}
          <rect x="596" y="45"  width="4"   height="17"  fill="currentColor"/>

          <rect x="655" y="90"  width="45"  height="170" fill="currentColor"/>
          <rect x="663" y="100" width="8"   height="6"   fill="white" opacity="0.2"/>
          <rect x="676" y="100" width="8"   height="6"   fill="white" opacity="0.2"/>

          <rect x="720" y="50"  width="60"  height="210" fill="currentColor"/>
          <rect x="728" y="62"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="744" y="62"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="760" y="62"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="728" y="77"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="744" y="77"  width="10"  height="7"   fill="white" opacity="0.2"/>
          <rect x="760" y="77"  width="10"  height="7"   fill="white" opacity="0.2"/>
          {/* Antenna */}
          <rect x="748" y="35"  width="4"   height="17"  fill="currentColor"/>
          <circle cx="750" cy="33" r="3"  fill="currentColor"/>

          {/* Ground line */}
          <rect x="0" y="258" width="800" height="2" fill="currentColor" opacity="0.3"/>
        </svg>
        <div className="w-full max-w-[420px] p-8 sm:p-10 bg-background/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border-2 border-primary/50 relative z-10 space-y-8 transition-transform hover:-translate-y-1 duration-500">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ContaALL</h1>
              <p className="text-muted-foreground text-xs">Control de Accesos</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Iniciar Sesión</h2>
            <p className="text-muted-foreground mt-2">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="correo@ejemplo.com"
                          className="pl-11 h-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-11 pr-11 h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline"
              >
                Registrarse
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
