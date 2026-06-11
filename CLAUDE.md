# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Teen Girls Content Portal - A safe, anonymous platform for teenage girls in India with mobile (Expo/React Native) and web (Next.js) applications sharing TypeScript code.

## Commands

### Web (Next.js) - `/web`
```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
```

### Mobile (Expo) - `/mobile`
```bash
npm start            # Expo dev server
expo start --android # Android emulator
expo start --ios     # iOS simulator
npm run lint         # ESLint
npm run type-check   # TypeScript checking
```

### Supabase
```bash
supabase start       # Local dev (requires Docker)
supabase db push     # Push migrations
```

## Architecture

### Monorepo Structure
```
teen-portal/
├── web/        # Next.js API + admin (Vercel deployment)
├── mobile/     # Expo app (EAS deployment)
├── shared/     # Shared types, constants, and mock data
└── supabase/   # Database migrations and config
```

### Path Aliases (both projects)
- `@/*` → project root
- `@shared/*` → `../shared/*`

### Shared Code (`/shared`)
- `types/database.ts` - Supabase-generated types for all tables
- `types/api.ts` - API request/response types
- `constants/sections.ts` - 7 content sections with subcategories
- `constants/chatbot.ts` - Claude prompts and crisis keywords
- `mock/` - Mock data for UI development without backend

### Web API Routes (`/web/app/api/`)
- `/auth/*` - Registration, login, verification, parent consent
- `/content/[section]/*` - CRUD for content, likes, comments, reports
- `/messages/*` - Conversations and messaging
- `/chat/*` - AI chatbot with session management
- `/admin/moderation/*` - Content approval queue
- `/users/me` - User profile

### Mobile Navigation (`/mobile/app/`)
- `(auth)/` - Login, register, verify screens
- `(tabs)/` - Main tab navigation (home, explore, messages, profile)
- `content/[section]/[id].tsx` - Content detail screens

### Key Services (`/web/lib/services/`)
- `chatbot.ts` - Claude API (claude-sonnet-4-20250514) with crisis detection
- `moderation.ts` - AI content flagging (Perspective API)
- `email.ts` - Transactional emails (Resend)

### Validation (`/web/lib/validators/`)
All API input validated with Zod schemas. Key patterns:
- Pseudo names: 3-30 chars, alphanumeric + underscore only
- Passwords: min 8 chars, must include uppercase, lowercase, number

## Database Schema

Main tables in Supabase PostgreSQL:
- `users` - Profiles with pseudo_name, avatar, verification status
- `content` - Articles, forum posts, polls, quizzes (requires moderation)
- `comments` - Threaded comments with depth limit
- `messages` / `conversations` - Direct and group messaging
- `chat_sessions` / `chat_messages` - AI chatbot history
- `moderation_queue` - Pre-approval workflow
- `reports` - User-reported content

Key enums: UserStatus, UserRole, ContentType, ContentSection, ContentStatus

## Development Mode

The codebase supports UI development without Supabase:
- Web uses mock data in API routes (returns `MOCK_CURRENT_USER`, `MOCK_CONTENT`)
- Mobile uses mock implementations in `/mobile/lib/supabase.ts` and `/mobile/lib/api.ts`
- Set `NEXT_PUBLIC_DEV_MODE=true` (web) or `EXPO_PUBLIC_DEV_MODE=true` (mobile)

## Content Sections

Seven sections defined in `/shared/constants/sections.ts`:
relationships, fashion, health, school, career, period_health, beauty_selfcare

Each has: id, name, description, icon, color, subcategories (6 each)

## Special Considerations

- **Crisis Detection**: Chatbot monitors for crisis keywords and provides helpline info
- **Moderation**: All user content goes through moderation_queue before publishing
- **Age Verification**: Users 13-15 require parent consent (DPDP Act compliance)
- **Anonymous**: Users have pseudo-names and avatars, not real names
