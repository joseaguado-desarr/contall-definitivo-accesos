-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'supervisor');

-- Create enum for person type
CREATE TYPE public.person_type AS ENUM ('resident', 'employee', 'contractor');

-- Create enum for person status
CREATE TYPE public.person_status AS ENUM ('active', 'inactive', 'suspended');

-- Create enum for access method
CREATE TYPE public.access_method AS ENUM ('facial', 'qr', 'manual', 'card');

-- Create enum for access result
CREATE TYPE public.access_result AS ENUM ('authorized', 'denied', 'pending');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create persons table (residents, employees, contractors)
CREATE TABLE public.persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    document TEXT NOT NULL UNIQUE,
    type person_type NOT NULL DEFAULT 'resident',
    photo_url TEXT,
    status person_status NOT NULL DEFAULT 'active',
    phone TEXT,
    email TEXT,
    unit TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visits table
CREATE TABLE public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_name TEXT NOT NULL,
    visitor_document TEXT NOT NULL,
    visitor_phone TEXT,
    vehicle_plate TEXT,
    host_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
    host_name TEXT,
    reason TEXT,
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    exit_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'inside',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create access_logs table
CREATE TABLE public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    method access_method NOT NULL DEFAULT 'manual',
    result access_result NOT NULL DEFAULT 'authorized',
    direction TEXT NOT NULL DEFAULT 'entry',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blacklist table
CREATE TABLE public.blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for persons (all authenticated users with roles can access)
CREATE POLICY "Authenticated users can view persons"
ON public.persons FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and operators can manage persons"
ON public.persons FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- RLS Policies for visits
CREATE POLICY "Authenticated users can view visits"
ON public.visits FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and operators can manage visits"
ON public.visits FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- RLS Policies for access_logs
CREATE POLICY "Authenticated users can view access logs"
ON public.access_logs FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and operators can insert access logs"
ON public.access_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- RLS Policies for schedules
CREATE POLICY "Authenticated users can view schedules"
ON public.schedules FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can manage schedules"
ON public.schedules FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for blacklist
CREATE POLICY "Authenticated users can view blacklist"
ON public.blacklist FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can manage blacklist"
ON public.blacklist FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'), NEW.email);
  
  -- Auto-assign admin role to first user, operator to others
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operator');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();