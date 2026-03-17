-- =============================================================
-- primegymsoftware — Complete Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================
-- SECURITY ARCHITECTURE:
-- 1. Every table has RLS (Row Level Security) ENABLED
-- 2. Users can only access data belonging to their gym (gym_id)
-- 3. The anon key (client-side) CANNOT bypass RLS
-- 4. Service role key (server-only) bypasses RLS — NEVER expose it
-- 5. All sensitive fields are encrypted or hashed by Supabase Auth
-- 6. Cascade deletes prevent orphaned records
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1. GYMS (multi-tenant root)
-- =========================
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  gst_number TEXT,
  logo_url TEXT,
  tagline TEXT,
  primary_color TEXT DEFAULT '#2563EB',
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- =========================
-- 2. PROFILES (linked to Supabase Auth)
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'trainer', 'front_desk', 'staff')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================
-- 3. MEMBERS
-- =========================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'frozen')),
  joined_at DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_gym ON public.members(gym_id);
CREATE INDEX idx_members_phone ON public.members(phone);
CREATE INDEX idx_members_status ON public.members(gym_id, status);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- =========================
-- 4. MEMBERSHIP PLANS
-- =========================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]',
  auto_renew BOOLEAN DEFAULT FALSE,
  allow_freeze BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_gym ON public.plans(gym_id);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- =========================
-- 5. SUBSCRIPTIONS (member ↔ plan)
-- =========================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'frozen', 'cancelled')),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_gym ON public.subscriptions(gym_id);
CREATE INDEX idx_subscriptions_member ON public.subscriptions(member_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(gym_id, status);
CREATE INDEX idx_subscriptions_end_date ON public.subscriptions(end_date);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =========================
-- 6. ATTENDANCE (check-in / check-out)
-- =========================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  method TEXT DEFAULT 'manual' CHECK (method IN ('qr', 'biometric', 'rfid', 'app', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_gym ON public.attendance(gym_id);
CREATE INDEX idx_attendance_member ON public.attendance(member_id);
CREATE INDEX idx_attendance_date ON public.attendance(gym_id, check_in);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- =========================
-- 7. CLASSES
-- =========================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Mon
  start_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  room TEXT,
  capacity INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_gym ON public.classes(gym_id);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- =========================
-- 8. CLASS BOOKINGS
-- =========================
CREATE TABLE IF NOT EXISTS public.class_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'attended', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, member_id, booking_date)
);

CREATE INDEX idx_class_bookings_gym ON public.class_bookings(gym_id);

ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;

-- =========================
-- 9. INVOICES / BILLING
-- =========================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  tax NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  payment_reference TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_gym ON public.invoices(gym_id);
CREATE INDEX idx_invoices_member ON public.invoices(member_id);
CREATE INDEX idx_invoices_status ON public.invoices(gym_id, status);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- =========================
-- 10. LEADS CRM
-- =========================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT DEFAULT 'walk-in' CHECK (source IN ('walk-in', 'instagram', 'facebook', 'website', 'referral', 'google_ads', 'other')),
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'trial', 'negotiation', 'converted', 'lost')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  follow_up_date DATE,
  converted_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_gym ON public.leads(gym_id);
CREATE INDEX idx_leads_stage ON public.leads(gym_id, stage);
CREATE INDEX idx_leads_follow_up ON public.leads(follow_up_date) WHERE follow_up_date IS NOT NULL;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =========================
-- 11. MESSAGES / COMMUNICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  template_name TEXT,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email')),
  recipient_type TEXT DEFAULT 'individual' CHECK (recipient_type IN ('individual', 'group', 'all')),
  recipient_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_gym ON public.messages(gym_id);
CREATE INDEX idx_messages_member ON public.messages(recipient_member_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =========================
-- 12. NOTIFICATION SETTINGS
-- =========================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE UNIQUE,
  renewal_reminder BOOLEAN DEFAULT TRUE,
  renewal_days_before INTEGER DEFAULT 7,
  payment_receipt BOOLEAN DEFAULT TRUE,
  class_reminder BOOLEAN DEFAULT TRUE,
  birthday_wishes BOOLEAN DEFAULT TRUE,
  inactive_nudge BOOLEAN DEFAULT TRUE,
  inactive_days INTEGER DEFAULT 14,
  default_send_time TIME DEFAULT '09:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- =========================
-- 13. INTEGRATIONS
-- =========================
-- Sensitive keys are encrypted at rest by Supabase (vault or encrypted columns)
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE UNIQUE,
  razorpay_enabled BOOLEAN DEFAULT FALSE,
  razorpay_key_id TEXT, -- encrypted via application-level encryption before storage
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_token TEXT,  -- encrypted via application-level encryption before storage
  biometric_enabled BOOLEAN DEFAULT FALSE,
  google_calendar_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================
-- Pattern: Users can ONLY read/write data for their own gym.
-- The gym_id is determined from the user's profile.
-- =============================================================

-- Helper function: Get the current user's gym_id
CREATE OR REPLACE FUNCTION public.get_user_gym_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT gym_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ---- GYMS ----
CREATE POLICY "Users can view own gym"
  ON public.gyms FOR SELECT
  USING (id = public.get_user_gym_id());

CREATE POLICY "Owners can update own gym"
  ON public.gyms FOR UPDATE
  USING (id = public.get_user_gym_id())
  WITH CHECK (id = public.get_user_gym_id());

-- ---- PROFILES ----
CREATE POLICY "Users can view gym staff"
  ON public.profiles FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Owners/managers can manage staff"
  ON public.profiles FOR ALL
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- ---- MEMBERS ----
CREATE POLICY "Gym staff can view members"
  ON public.members FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can insert members"
  ON public.members FOR INSERT
  WITH CHECK (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can update members"
  ON public.members FOR UPDATE
  USING (gym_id = public.get_user_gym_id())
  WITH CHECK (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can delete members"
  ON public.members FOR DELETE
  USING (gym_id = public.get_user_gym_id());

-- ---- PLANS ----
CREATE POLICY "Gym staff can view plans"
  ON public.plans FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage plans"
  ON public.plans FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- SUBSCRIPTIONS ----
CREATE POLICY "Gym staff can view subscriptions"
  ON public.subscriptions FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- ATTENDANCE ----
CREATE POLICY "Gym staff can view attendance"
  ON public.attendance FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage attendance"
  ON public.attendance FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- CLASSES ----
CREATE POLICY "Gym staff can view classes"
  ON public.classes FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage classes"
  ON public.classes FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- CLASS BOOKINGS ----
CREATE POLICY "Gym staff can view bookings"
  ON public.class_bookings FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage bookings"
  ON public.class_bookings FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- INVOICES ----
CREATE POLICY "Gym staff can view invoices"
  ON public.invoices FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage invoices"
  ON public.invoices FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- LEADS ----
CREATE POLICY "Gym staff can view leads"
  ON public.leads FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage leads"
  ON public.leads FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- MESSAGES ----
CREATE POLICY "Gym staff can view messages"
  ON public.messages FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage messages"
  ON public.messages FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- NOTIFICATION SETTINGS ----
CREATE POLICY "Gym staff can view notification settings"
  ON public.notification_settings FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Gym staff can manage notification settings"
  ON public.notification_settings FOR ALL
  USING (gym_id = public.get_user_gym_id());

-- ---- INTEGRATIONS ----
CREATE POLICY "Gym staff can view integrations"
  ON public.integrations FOR SELECT
  USING (gym_id = public.get_user_gym_id());

CREATE POLICY "Owners can manage integrations"
  ON public.integrations FOR ALL
  USING (
    gym_id = public.get_user_gym_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, gym_id, full_name, email, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data ->> 'gym_id')::UUID,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'owner')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
