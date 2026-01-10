# FlyWithPoints

A modern web application that helps travelers find the best award flight redemptions in real-time, with AI-powered recommendations for optimal points transfers between airline and credit card partners.

![FlyWithPoints](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/license-MIT-blue)
![Hosted](https://img.shields.io/badge/Hosted-Vercel-black)

## Features

- **Award Flight Search**: Search for award availability across 15+ airline loyalty programs
- **AI-Powered Recommendations**: Get personalized suggestions for optimal points transfers and redemptions
- **Points Wallet**: Track your balances across multiple loyalty programs
- **Sweet Spots Database**: Discover curated high-value redemption opportunities
- **Real-Time Valuations**: Know exactly what your points are worth with cents-per-point calculations
- **Modern UI/UX**: Clean, minimal design with smooth animations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animations**: Framer Motion
- **Hosting**: Vercel (100% free tier)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/digrajkarmeetwork/flywithpoints.git
   cd flywithpoints
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase/schema.sql`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel (Recommended - Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your Vercel URL)

## Free Hosting Stack

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Vercel | Frontend + API | Unlimited requests, 100GB bandwidth |
| Supabase | Database + Auth | 500MB database, 50K MAU |
| OpenAI | AI recommendations | Pay-as-you-go (optional) |

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main app pages
│   └── api/               # API routes
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── search/           # Search-related components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # shadcn/ui components
├── data/                  # Static data (programs, airports)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client configuration
├── stores/               # Zustand stores
└── types/                # TypeScript types
```

## Supported Programs

### Credit Card Partners
- Chase Ultimate Rewards
- Amex Membership Rewards
- Citi ThankYou Points
- Capital One Miles
- Bilt Rewards

### Airline Programs
- United MileagePlus
- American AAdvantage
- Delta SkyMiles
- Southwest Rapid Rewards
- Alaska Mileage Plan
- JetBlue TrueBlue
- Air Canada Aeroplan
- British Airways Avios
- Air France/KLM Flying Blue
- Singapore KrisFlyer
- Virgin Atlantic Flying Club
- Emirates Skywards

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Vercel](https://vercel.com) for hosting
- [Supabase](https://supabase.com) for the database and auth
- [The Points Guy](https://thepointsguy.com) for points valuation inspiration
