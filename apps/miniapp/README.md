# LaunchKit AI - Mini App

Telegram Mini App for LaunchKit AI, built with Vite, React 18, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Telegram-native design system** with automatic theme adaptation
- 📱 **8pt grid system** for consistent spacing
- ♿ **Accessibility-focused** with minimum 44x44px touch targets
- 🌓 **Light/Dark mode** support via Telegram theme
- 🎭 **shadcn/ui components** pre-configured
- ⚡ **Vite** for lightning-fast development
- 📦 **TypeScript** for type safety
- 🧭 **React Router** with 8 screens
- 🎬 **Framer Motion** animations
- 📳 **Haptic feedback** on all interactions
- 🔘 **MainButton/BackButton** integration

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start dev server
pnpm dev
```

App will be available at: http://localhost:3000

## Build

```bash
pnpm build
```

Output will be in `dist/` directory.

## Design System

### Colors

The app automatically adapts to Telegram's theme using CSS variables:
- Primary: Indigo (#6366F1)
- Success: Emerald (#10B981)
- Warning: Amber (#F59E0B)
- Destructive: Red (#ef4444)

### Components

All components are in `src/components/ui/`:
- `Button` - Multiple variants (default, secondary, outline, ghost, success)
- `Input` / `Textarea` - Form inputs
- `Card` - Content containers
- `Badge` - Status indicators
- `Progress` - Progress bars
- `Skeleton` - Loading states
- `Toast` - Notifications

### Utilities

- `src/lib/telegram-theme.ts` - Telegram theme integration
- `src/lib/utils.ts` - Utility functions
- `src/hooks/useTelegram.ts` - Telegram WebApp hook

## Project Structure

```
apps/miniapp/
├── src/
│   ├── components/
│   │   └── ui/           # UI components
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilities
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

## App Structure

### 8 Screens
1. **Home** (`/`) - Landing page with 3 action cards
2. **AI Chat** (`/ai-chat`) - Conversation with Claude AI
3. **Idea Results** (`/idea-results`) - 3 generated startup ideas
4. **Loading** (`/loading`) - Animated spec generation
5. **Tech Spec** (`/tech-spec`) - Detailed technical specification
6. **Marketplace** (`/marketplace`) - Browse 20 freelancers
7. **DFY Form** (`/dfy`) - Request full-service launch
8. **Success** (`/success`) - Confirmation screen

### User Flows
- **Idea Generation**: Home → AI Chat → Ideas → Loading → Tech Spec
- **Team Hiring**: Home → Marketplace → (Contact)
- **Full Service**: Home → DFY → Success

## Telegram WebApp Integration

Complete `useTelegram()` hook with:
- Theme adaptation (light/dark mode)
- User authentication via initData
- Main Button / Back Button controls
- Haptic feedback (impact, notification, selection)
- Safe area support (iOS notch)
- Dialogs (alert, confirm)
- Navigation utilities

## Environment Variables

Create `.env.local` for local development:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
```

## Deployment

### Vercel (Recommended)

```bash
pnpm build
# Deploy dist/ folder
```

### Netlify

```bash
# Build command
pnpm build

# Publish directory
dist
```

## Learn More

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [shadcn/ui](https://ui.shadcn.com)

