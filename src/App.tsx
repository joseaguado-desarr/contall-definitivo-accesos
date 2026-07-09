import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Persons from "@/pages/Persons";
import Visitors from "@/pages/Visitors";
import AccessControl from "@/pages/AccessControl";
import AccessHistory from "@/pages/AccessHistory";
import Reports from "@/pages/Reports";
import AdminSettings from "@/pages/AdminSettings";
import ComingSoon from "@/components/ComingSoon";
import NotFound from "@/pages/NotFound";
import Users from "@/pages/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/persons" element={<Persons />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/access-control" element={<AccessControl />} />
            <Route path="/history" element={<AccessHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin/users" element={<Users />} />
            <Route
              path="/admin/schedules"
              element={<ComingSoon title="Horarios" description="Configuración de horarios de acceso" />}
            />
            <Route
              path="/admin/blacklist"
              element={<ComingSoon title="Lista Negra" description="Gestión de personas no autorizadas" />}
            />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
