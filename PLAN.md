# FlyWithPoints - Award Flight Optimizer

## Vision
A modern web application that helps travelers find the best award flight redemptions in real-time, with AI-powered recommendations for optimal points transfers between airline and credit card partners.

---

## Core Features

### 1. Award Flight Search Engine
- **Multi-program search**: Search across major airline programs simultaneously
  - United MileagePlus
  - American AAdvantage
  - Delta SkyMiles
  - Southwest Rapid Rewards
  - Alaska Mileage Plan
  - JetBlue TrueBlue
  - Air Canada Aeroplan
  - British Airways Avios
  - Flying Blue (Air France/KLM)
  - Singapore Airlines KrisFlyer

- **Real-time availability**: Scrape/API integration for live award seat availability
- **Flexible date search**: Calendar view showing best redemption values across date ranges
- **Class filtering**: Economy, Premium Economy, Business, First Class
- **Route optimization**: Suggest alternative airports/routes for better value

### 2. Points Valuation & Transfer Optimization (AI-Powered)
- **Dynamic points valuations**: Calculate cents-per-point value for each redemption
- **Transfer partner mapping**: Show all credit card → airline transfer paths
  - Chase Ultimate Rewards
  - Amex Membership Rewards
  - Citi ThankYou Points
  - Capital One Miles
  - Bilt Rewards

- **AI Recommendations**:
  - Best program to book specific routes
  - Optimal transfer timing (bonus promotions)
  - Sweet spot alerts (outsized value redemptions)
  - Portfolio optimization based on user's point balances

### 3. User Dashboard
- **Points wallet**: Track balances across all programs
- **Saved searches**: Monitor routes for availability
- **Price/availability alerts**: Email/push notifications
- **Booking history**: Track past redemptions and values achieved
- **Wishlist**: Dream trips with estimated points needed

### 4. Discovery & Inspiration
- **Sweet spot database**: Curated list of best-value redemptions
- **Route guides**: Detailed booking guides for popular routes
- **Program reviews**: Pros/cons of each loyalty program
- **Transfer bonus tracker**: Current and historical bonus offers

### 5. Community Features
- **Trip reports**: User-submitted flight reviews
- **Availability reports**: Crowdsourced award availability data
- **Discussion forums**: Q&A for complex bookings

---

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Next.js API Routes (Edge Functions where possible)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google, Email/Password)
- **AI/ML**: OpenAI API (GPT-4) for recommendations
- **Background Jobs**: Vercel Cron + Supabase Edge Functions
- **Search**: Supabase Full-Text Search

### Data Sources
- **Award availability**:
  - Seats.aero API (primary - aggregates multiple programs)
  - AwardFares (backup/comparison)
  - Direct airline APIs where available
- **Flight data**: Google Flights API / Amadeus API
- **Points valuations**: The Points Guy, custom calculations

### Free Hosting Stack
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Vercel | Frontend + API | 100GB bandwidth, unlimited requests |
| Supabase | Database + Auth | 500MB DB, 50K monthly active users |
| OpenAI | AI recommendations | $5 free credits (then usage-based) |
| Upstash | Redis caching | 10K commands/day |
| Resend | Email notifications | 3000 emails/month |
| GitHub Actions | CI/CD | 2000 minutes/month |

---

## Database Schema

```sql
-- Users (managed by Supabase Auth)
-- Additional user profile data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points balances
CREATE TABLE point_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

-- Loyalty programs
CREATE TABLE loyalty_programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'airline', 'hotel', 'credit_card'
  logo_url TEXT,
  base_value_cpp DECIMAL(4,2), -- cents per point
  transfer_partners JSONB DEFAULT '[]'
);

-- Saved searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Award availability cache
CREATE TABLE award_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL, -- 'JFK-LHR'
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

-- Sweet spots
CREATE TABLE sweet_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  search_id UUID REFERENCES saved_searches(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'availability', 'price_drop', 'transfer_bonus'
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transfer bonuses
CREATE TABLE transfer_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_program TEXT NOT NULL,
  to_program TEXT REFERENCES loyalty_programs(id),
  bonus_percentage INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  terms TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## UI/UX Design Principles

### Design System
- **Color Palette**:
  - Primary: Deep blue (#1E40AF) - trust, travel
  - Accent: Vibrant orange (#F97316) - energy, deals
  - Success: Emerald (#10B981) - good value
  - Background: Slate grays (#F8FAFC, #F1F5F9)

- **Typography**:
  - Headings: Inter (bold, clean)
  - Body: Inter (readable, modern)

- **Design Tokens**:
  - Rounded corners (8px default)
  - Subtle shadows for depth
  - Generous whitespace
  - Micro-interactions on hover/click

### Key Screens

1. **Home / Search**
   - Hero with search form (origin, destination, dates, class)
   - Quick links to saved searches
   - Featured sweet spots carousel
   - Recent transfer bonus highlights

2. **Search Results**
   - Split view: list + map
   - Filter sidebar (programs, dates, cabin)
   - Sort by: points, value, availability
   - Each result shows: route, points, taxes, value indicator

3. **Flight Detail**
   - Full itinerary breakdown
   - Alternative booking options
   - Transfer paths to accumulate points
   - AI recommendation card
   - Book now CTA (links to airline)

4. **Dashboard**
   - Points balance overview (visual cards)
   - Upcoming trips
   - Active alerts
   - Recommended opportunities

5. **Points Wallet**
   - Add/edit program balances
   - Total value calculation
   - Transfer partner visualization
   - Historical balance chart

6. **Sweet Spots Browser**
   - Filterable grid of opportunities
   - Region/program/class filters
   - Value ratings

---

## Implementation Phases

### Phase 1: Foundation (MVP)
- [x] Project setup (Next.js, Tailwind, shadcn/ui)
- [ ] Supabase integration (auth, database)
- [ ] Basic search UI
- [ ] Mock data for award availability
- [ ] User registration/login
- [ ] Points wallet (manual entry)

### Phase 2: Core Search
- [ ] Integrate Seats.aero API
- [ ] Real-time availability display
- [ ] Date flexibility search
- [ ] Cabin class filtering
- [ ] Save search functionality

### Phase 3: AI Features
- [ ] OpenAI integration
- [ ] Transfer optimization recommendations
- [ ] Value analysis per search
- [ ] Sweet spot suggestions

### Phase 4: Alerts & Notifications
- [ ] Email alerts setup (Resend)
- [ ] Availability monitoring (cron jobs)
- [ ] Transfer bonus tracking
- [ ] Push notifications (optional)

### Phase 5: Community & Polish
- [ ] Sweet spots database UI
- [ ] User trip reports
- [ ] Performance optimization
- [ ] Mobile responsiveness refinement
- [ ] SEO optimization

---

## API Integrations

### Seats.aero
- Primary source for award availability
- Covers most major programs
- Rate limits apply (caching essential)

### OpenAI (GPT-4)
Prompts for:
- "Given these award options, recommend the best value..."
- "What transfer path should I use to book..."
- "Analyze this user's points portfolio and suggest..."

### Amadeus (optional)
- Flight schedules
- Airport data
- Pricing benchmarks

---

## Security Considerations
- Row-Level Security (RLS) in Supabase
- API key protection via environment variables
- Rate limiting on API routes
- Input sanitization
- HTTPS everywhere (Vercel default)

---

## Monetization (Future)
- Freemium model (basic search free, alerts/AI premium)
- Affiliate links to credit card offers
- Premium sweet spot guides
- API access for developers

---

## Success Metrics
- Monthly active users
- Searches performed
- Alerts created
- Points value tracked
- User retention rate

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
SEATS_AERO_API_KEY=
RESEND_API_KEY=
```
