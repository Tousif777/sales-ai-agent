# SalesAI Agent - AI-Powered Sales SaaS Platform

A comprehensive sales automation platform built with Next.js, featuring AI-powered lead qualification, customer outreach, and conversation management.

## Features

- **Landing Page**: Premium design with conversion-optimized pricing cards
- **Floating Web Widget**: One-line script to embed a chat bubble on any website
- **Dashboard**: Real-time sales analytics and message tracking
- **Flexible Product Catalog**: Manage products with custom fields (Color, Size, SKU)
- **Order Management**: Track orders and manage stock automatically from chat
- **Stripe Integration**: SaaS billing with Basic (Free) and Pro ($99/mo) plans
- **Agent Personality**: Fully customizable system prompts and behavioral rules

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
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
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
│   │       ├── agent/        # AI agent configuration
│   │       ├── analytics/    # Analytics dashboard
│   │       ├── chat/         # AI chat interface
│   │       ├── conversations/# Prospect conversations
│   │       ├── orders/       # Order management
│   │       ├── products/     # Product catalog
│   │       └── settings/     # Account settings
│   └── api/
│       ├── webhooks/         # Clerk & Stripe webhooks
│       ├── agent/            # AI agent endpoints
│       ├── chat/             # Chat endpoints
│       ├── billing/          # Billing portal
│       ├── orders/           # Order CRUD
│       ├── products/         # Product CRUD
│       └── settings/         # User settings
├── components/
│   └── ui/                   # UI components
└── lib/
    ├── db.ts                 # Prisma client singleton
    ├── openai.ts             # OpenAI utilities
    ├── stripe.ts             # Stripe utilities
    └── utils.ts              # Helper functions
```

## Pricing Tiers

### Basic Plan (Free)
- 50 AI messages per month
- Floating Web Widget embed
- Flexible product attributes

### Pro Plan ($99/month)
- 2,000 AI messages per month
- Everything in Basic
- Priority email support
- Advanced Sales Intelligence

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

The application uses PostgreSQL with the following main models:

- **User**: User account with subscription info and plan details
- **Prospect**: Sales prospects/deals with status tracking (Pending, Converted, Failed)
- **VoiceLog**: Voice call transcripts and outcomes
- **ChatLog**: Text conversation messages with role tracking (User, AI, System)
- **AIAgent**: AI agent configuration including name, system prompt, and temperature
- **Product**: Product catalog with pricing, inventory, and custom attributes
- **Order**: Sales orders linked to prospects with status tracking
- **OrderItem**: Individual items within orders

Key Features:
- Multi-role AI conversations (USER, AI, SYSTEM)
- Deal status tracking (PENDING, CONVERTED, FAILED)
- Subscription management (TRIAL, ACTIVE, PAST_DUE, CANCELED)
- Order lifecycle (PENDING, CONFIRMED, COMPLETED, CANCELED)
- Cascading deletes for data integrity

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
