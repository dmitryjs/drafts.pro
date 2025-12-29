# CodeQuest - Coding Practice Platform

## Overview

CodeQuest is a mobile-first coding practice platform built as a full-stack TypeScript application. It provides learning tracks, coding problems, and submission tracking for users to improve their programming skills. The application features a React frontend with a modern UI component library and an Express backend with PostgreSQL database storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state with local caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful endpoints defined in shared route definitions with Zod validation
- **Build System**: Custom build script using esbuild for server bundling, Vite for client

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - contains all table definitions
- **Migrations**: Drizzle Kit manages schema migrations in `/migrations`
- **Tables**: users, profiles, tracks, problems, submissions

### Authentication
- **Provider**: Supabase Auth with email OTP (magic link) authentication
- **Client Integration**: Supabase JS client initialized conditionally based on environment variables
- **Protected Routes**: React context-based auth state with route protection component
- **Profile Sync**: Backend endpoint syncs Supabase auth users with local profiles table

### Code Organization
- `/client` - React frontend application
- `/server` - Express backend with routes and storage layer
- `/shared` - Shared types, schemas, and route definitions between client and server
- Path aliases: `@/` for client src, `@shared/` for shared code

### Key Design Patterns
- **Shared Route Contracts**: API routes defined once in `shared/routes.ts` with Zod schemas for type-safe client-server communication
- **Storage Abstraction**: `IStorage` interface in server allows swapping implementations
- **Mock Data Fallback**: Client hooks fall back to mock data when API is unavailable
- **Component Composition**: UI built from composable shadcn/ui components

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building

### Authentication
- **Supabase**: Auth provider requiring `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- Falls back gracefully when credentials not configured

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, menus, forms, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Data visualization charts

### Build Tools
- **Vite**: Frontend development server and production bundler
- **esbuild**: Server-side bundling for production
- **TypeScript**: Full type coverage across frontend and backend