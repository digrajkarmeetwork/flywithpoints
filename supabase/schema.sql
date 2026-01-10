-- FlyWithPoints Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Extended user profile information
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- LOYALTY PROGRAMS TABLE
-- Reference data for loyalty programs
-- =====================================================
CREATE TABLE loyalty_programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('airline', 'hotel', 'credit_card')),
  logo_url TEXT,
  base_value_cpp DECIMAL(4,2) DEFAULT 1.0,
  alliance TEXT CHECK (alliance IN ('oneworld', 'skyteam', 'star_alliance', NULL)),
  transfer_partners JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make loyalty_programs publicly readable
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Loyalty programs are publicly readable"
  ON loyalty_programs FOR SELECT
  TO authenticated, anon
  USING (true);

-- =====================================================
-- POINT BALANCES TABLE
-- User's points/miles balances across programs
-- =====================================================
CREATE TABLE point_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL REFERENCES loyalty_programs(id),
  balance INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE point_balances ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own balances"
  ON point_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balances"
  ON point_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balances"
  ON point_balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own balances"
  ON point_balances FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SAVED SEARCHES TABLE
-- User's saved flight searches for monitoring
-- =====================================================
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE,
  return_date DATE,
  cabin_class TEXT DEFAULT 'economy',
  passengers INTEGER DEFAULT 1,
  is_flexible BOOLEAN DEFAULT false,
  alert_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ALERTS TABLE
-- User alert configurations
-- =====================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  search_id UUID REFERENCES saved_searches(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('availability', 'price_drop', 'transfer_bonus')),
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SWEET SPOTS TABLE
-- Curated high-value redemptions
-- =====================================================
CREATE TABLE sweet_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  program_id TEXT REFERENCES loyalty_programs(id),
  origin_region TEXT,
  destination_region TEXT,
  cabin_class TEXT,
  points_required INTEGER,
  typical_cash_price INTEGER,
  value_cpp DECIMAL(4,2),
  booking_tips TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make sweet_spots publicly readable
ALTER TABLE sweet_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sweet spots are publicly readable"
  ON sweet_spots FOR SELECT
  TO authenticated, anon
  USING (true);

-- =====================================================
-- TRANSFER BONUSES TABLE
-- Current and historical transfer bonus offers
-- =====================================================
CREATE TABLE transfer_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_program TEXT NOT NULL,
  to_program TEXT REFERENCES loyalty_programs(id),
  bonus_percentage INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  terms TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make transfer_bonuses publicly readable
ALTER TABLE transfer_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transfer bonuses are publicly readable"
  ON transfer_bonuses FOR SELECT
  TO authenticated, anon
  USING (true);

-- =====================================================
-- AWARD AVAILABILITY CACHE TABLE
-- Cached award availability data
-- =====================================================
CREATE TABLE award_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route TEXT NOT NULL,
  program_id TEXT REFERENCES loyalty_programs(id),
  departure_date DATE NOT NULL,
  cabin_class TEXT NOT NULL,
  points_required INTEGER,
  taxes_fees DECIMAL(10,2),
  seats_available INTEGER,
  source TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route, program_id, departure_date, cabin_class)
);

-- Make award_availability publicly readable
ALTER TABLE award_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Award availability is publicly readable"
  ON award_availability FOR SELECT
  TO authenticated, anon
  USING (true);

-- =====================================================
-- SEED DATA: LOYALTY PROGRAMS
-- =====================================================
INSERT INTO loyalty_programs (id, name, type, base_value_cpp, alliance, transfer_partners) VALUES
  ('united-mileageplus', 'United MileagePlus', 'airline', 1.2, 'star_alliance', '["chase-ur", "bilt"]'),
  ('american-aadvantage', 'American AAdvantage', 'airline', 1.4, 'oneworld', '["citi-typ", "bilt"]'),
  ('delta-skymiles', 'Delta SkyMiles', 'airline', 1.1, 'skyteam', '["amex-mr"]'),
  ('southwest-rr', 'Southwest Rapid Rewards', 'airline', 1.4, NULL, '["chase-ur"]'),
  ('alaska-mileageplan', 'Alaska Mileage Plan', 'airline', 1.8, 'oneworld', '["bilt"]'),
  ('jetblue-trueblue', 'JetBlue TrueBlue', 'airline', 1.3, NULL, '["chase-ur", "citi-typ", "bilt"]'),
  ('aeroplan', 'Air Canada Aeroplan', 'airline', 1.5, 'star_alliance', '["chase-ur", "amex-mr", "capital-one", "bilt"]'),
  ('avios', 'British Airways Avios', 'airline', 1.5, 'oneworld', '["chase-ur", "amex-mr", "capital-one", "bilt"]'),
  ('flying-blue', 'Air France/KLM Flying Blue', 'airline', 1.4, 'skyteam', '["chase-ur", "amex-mr", "citi-typ", "capital-one", "bilt"]'),
  ('krisflyer', 'Singapore KrisFlyer', 'airline', 1.6, 'star_alliance', '["chase-ur", "amex-mr", "citi-typ", "capital-one", "bilt"]'),
  ('virginatlantic', 'Virgin Atlantic Flying Club', 'airline', 1.5, NULL, '["chase-ur", "amex-mr", "citi-typ", "capital-one", "bilt"]'),
  ('emirates-skywards', 'Emirates Skywards', 'airline', 1.0, NULL, '["amex-mr", "capital-one", "citi-typ", "bilt"]'),
  ('chase-ur', 'Chase Ultimate Rewards', 'credit_card', 1.5, NULL, '["united-mileageplus", "southwest-rr", "jetblue-trueblue", "aeroplan", "avios", "flying-blue", "krisflyer", "virginatlantic"]'),
  ('amex-mr', 'Amex Membership Rewards', 'credit_card', 1.6, NULL, '["delta-skymiles", "aeroplan", "avios", "flying-blue", "krisflyer", "virginatlantic", "emirates-skywards"]'),
  ('citi-typ', 'Citi ThankYou Points', 'credit_card', 1.4, NULL, '["american-aadvantage", "jetblue-trueblue", "flying-blue", "krisflyer", "virginatlantic", "emirates-skywards"]'),
  ('capital-one', 'Capital One Miles', 'credit_card', 1.4, NULL, '["aeroplan", "avios", "flying-blue", "krisflyer", "virginatlantic", "emirates-skywards"]'),
  ('bilt', 'Bilt Rewards', 'credit_card', 1.6, NULL, '["united-mileageplus", "american-aadvantage", "alaska-mileageplan", "jetblue-trueblue", "aeroplan", "avios", "flying-blue", "krisflyer", "virginatlantic", "emirates-skywards"]')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_point_balances_user_id ON point_balances(user_id);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_award_availability_route ON award_availability(route);
CREATE INDEX idx_award_availability_date ON award_availability(departure_date);
CREATE INDEX idx_transfer_bonuses_dates ON transfer_bonuses(start_date, end_date);
