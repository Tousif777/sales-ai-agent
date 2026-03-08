# SalesAI Agent - AI-Powered Sales SaaS Platform

A comprehensive sales automation platform built with Next.js, featuring AI-powered lead qualification, customer outreach, and conversation management.

## Features

- **Landing Page**: Clean, modern design with pricing tiers (Basic & Pro)
- **Dashboard**: Real-time analytics and performance metrics
- **Lead Management**: Track and manage your sales pipeline
- **AI Conversations**: Chat with your AI sales assistant
- **Agent Configuration**: Customize your AI's personality and behavior
- **Analytics**: Track conversion rates and AI activity
- **Stripe Integration**: Subscription billing with Basic ($49/mo) and Pro ($149/mo) plans

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4
- **Payments**: Stripe
- **Styling**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Accounts with:
  - [Clerk](https://clerk.com)
  - [OpenAI](https://platform.openai.com)
  - [Stripe](https://stripe.com)

### Installation

1. **Clone the repository**
   ```bash
   cd sales-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_WEBHOOK_SECRET`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_BASIC_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID`
   - `OPENAI_API_KEY`

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Landing page
│   ├── (auth)/               # Sign in/up pages
│   ├── (dashboard)/          # Dashboard pages
│   │   └── dashboard/
│   │       ├── page.tsx      # Dashboard home
│   │       ├── leads/        # Leads management
│   │       ├── conversations/# AI chat interface
│   │       ├── agent/        # AI configuration
│   │       ├── analytics/    # Analytics dashboard
│   │       └── settings/     # Account settings
│   └── api/
│       ├── webhooks/         # Clerk & Stripe webhooks
│       ├── ai/               # AI endpoints
│       ├── leads/            # Lead CRUD
│       └── billing/          # Billing portal
├── components/
│   └── ui/                   # UI components
└── lib/
    ├── db.ts                 # Prisma client
    ├── openai.ts             # OpenAI utilities
    ├── stripe.ts             # Stripe utilities
    └── utils.ts              # Helper functions
```

## Pricing Tiers

### Basic Plan ($49/month)
- 1,000 leads
- 5,000 AI messages/month
- Lead qualification
- Email support

### Pro Plan ($149/month)
- Unlimited leads
- Unlimited AI messages
- Priority support
- Custom integrations
- API access

## Configuration

### Clerk Setup

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Enable email/password authentication
4. Configure webhook endpoint: `/api/webhooks/clerk`
5. Subscribe to events: `user.created`, `user.deleted`

### Stripe Setup

1. Create products and prices in Stripe Dashboard:
   - Basic Plan: $49/month
   - Pro Plan: $149/month
2. Get price IDs for each plan
3. Configure webhook endpoint: `/api/webhooks/stripe`
4. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### OpenAI Setup

1. Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

## Database Schema

The application uses the following main models:
- **User**: User account with subscription info
- **Lead**: Sales leads with status tracking
- **Conversation**: Chat conversations
- **Message**: Individual chat messages
- **AIAgent**: AI agent configuration

See `prisma/schema.prisma` for complete schema.

## Development

### Running Migrations

```bash
npx prisma migrate dev
```

### Resetting Database

```bash
npx prisma migrate reset
```

### Viewing Database

```bash
npx prisma studio
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

Make sure to set up production databases and update all URLs in environment variables.

## License

MIT
