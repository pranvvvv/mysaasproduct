// Supabase database types — auto-generated structure matching schema.sql
// In production, generate with: npx supabase gen types typescript --project-id ofwzheinhxaglknrrksa > lib/supabase/types.ts

export type Gym = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  gst_number: string | null;
  logo_url: string | null;
  tagline: string | null;
  primary_color: string;
  plan: 'starter' | 'pro' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  gym_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'owner' | 'manager' | 'trainer' | 'front_desk' | 'staff';
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  gym_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  gender: 'male' | 'female' | 'other' | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact: string | null;
  photo_url: string | null;
  status: 'active' | 'inactive' | 'expired' | 'frozen';
  joined_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Plan = {
  id: string;
  gym_id: string;
  name: string;
  duration_days: number;
  price: number;
  description: string | null;
  features: string[];
  auto_renew: boolean;
  allow_freeze: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  gym_id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'frozen' | 'cancelled';
  trainer_id: string | null;
  amount_paid: number;
  created_at: string;
};

export type Attendance = {
  id: string;
  gym_id: string;
  member_id: string;
  check_in: string;
  check_out: string | null;
  method: 'qr' | 'biometric' | 'rfid' | 'app' | 'manual';
  created_at: string;
};

export type GymClass = {
  id: string;
  gym_id: string;
  name: string;
  type: string | null;
  trainer_id: string | null;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  room: string | null;
  capacity: number;
  is_active: boolean;
  created_at: string;
};

export type ClassBooking = {
  id: string;
  gym_id: string;
  class_id: string;
  member_id: string;
  booking_date: string;
  status: 'booked' | 'attended' | 'cancelled' | 'no_show';
  created_at: string;
};

export type Invoice = {
  id: string;
  gym_id: string;
  member_id: string;
  subscription_id: string | null;
  invoice_number: string;
  amount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method: string | null;
  payment_reference: string | null;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  gym_id: string;
  name: string;
  phone: string;
  email: string | null;
  source: 'walk-in' | 'instagram' | 'facebook' | 'website' | 'referral' | 'google_ads' | 'other';
  stage: 'new' | 'contacted' | 'trial' | 'negotiation' | 'converted' | 'lost';
  assigned_to: string | null;
  notes: string | null;
  follow_up_date: string | null;
  converted_member_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  gym_id: string;
  template_name: string | null;
  channel: 'whatsapp' | 'sms' | 'email';
  recipient_type: 'individual' | 'group' | 'all';
  recipient_member_id: string | null;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  scheduled_at: string | null;
  sent_at: string;
  sent_by: string | null;
  created_at: string;
};

// Data mapping — which table stores what
// ┌─────────────────────┬──────────────────────┬───────────────────────────┐
// │ Dashboard Page       │ Supabase Table       │ What's Stored             │
// ├─────────────────────┼──────────────────────┼───────────────────────────┤
// │ Dashboard Home       │ members, attendance, │ KPIs, charts, alerts      │
// │                      │ subscriptions, leads │                           │
// │ Members              │ members              │ Full member CRUD          │
// │ Plans                │ plans                │ Membership plan configs   │
// │ Classes              │ classes,             │ Schedule, bookings        │
// │                      │ class_bookings       │                           │
// │ Attendance           │ attendance           │ Check-in/out logs         │
// │ Billing              │ invoices             │ Invoices, payments        │
// │ Analytics            │ All tables (read)    │ Aggregated analytics      │
// │ Leads CRM            │ leads                │ Lead pipeline + notes     │
// │ Messages             │ messages             │ Sent messages + templates │
// │ Settings: Gym Info   │ gyms                 │ Gym config                │
// │ Settings: Staff      │ profiles             │ Staff accounts            │
// │ Settings: Integr.    │ integrations         │ API keys (encrypted)      │
// │ Settings: Notifs     │ notification_settings│ Auto-msg preferences      │
// │ Auth (Login/Signup)  │ auth.users, profiles │ User accounts             │
// └─────────────────────┴──────────────────────┴───────────────────────────┘
