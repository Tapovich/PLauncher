# 📱 LaunchKit AI Mini App - Complete Guide

Complete Telegram Mini App with routing, animations, and WebApp SDK integration.

## 📊 Overview

The Mini App is built with:
- **React 18** + **TypeScript**
- **Vite** for fast development
- **React Router** for navigation
- **Framer Motion** for smooth animations
- **Telegram WebApp SDK** for native integration
- **Tailwind CSS** + **shadcn/ui** for design

---

## 🗺️ App Structure

### Routes & Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Home | Main landing with 3 action cards |
| `/ai-chat` | AI Chat | Conversation with Claude for idea generation |
| `/idea-results` | Idea Results | Display 3 generated startup ideas |
| `/loading` | Loading | Animated loading during spec generation |
| `/tech-spec` | Tech Spec Viewer | Detailed technical specification |
| `/marketplace` | Team Marketplace | Browse freelancers |
| `/dfy` | Done-For-You Form | Request full-service launch |
| `/success` | Success | Confirmation after submission |

---

## 🔧 Telegram WebApp SDK Integration

### useTelegram Hook

Complete hook in `src/hooks/useTelegram.ts`:

```typescript
import { useTelegram } from "@/hooks/useTelegram";

function MyComponent() {
  const {
    // WebApp instance
    webApp,
    
    // User data
    user,
    colorScheme,
    isReady,
    
    // Main Button
    showMainButton,
    hideMainButton,
    showMainButtonProgress,
    hideMainButtonProgress,
    
    // Back Button
    showBackButton,
    hideBackButton,
    
    // Haptic Feedback
    hapticImpact,
    hapticNotification,
    hapticSelection,
    
    // Dialogs
    showAlert,
    showConfirm,
    
    // Navigation
    close,
    openLink,
    
    // Theme
    themeParams,
    getSafeAreaInsets,
  } = useTelegram();

  return ...
}
```

### Features Implemented

#### 1. **WebApp Initialization**
```typescript
// Automatically called on mount
webApp.ready();
webApp.expand();
```

#### 2. **Theme Integration**
```typescript
// Theme params → CSS variables
applyThemeParams(themeParams);
// Auto-apply dark mode class
```

#### 3. **Main Button**
```typescript
// Show button with click handler
showMainButton("Continue", () => {
  navigate("/next");
}, {
  color: "#6366F1",
  textColor: "#ffffff",
});

// Show loading
showMainButtonProgress();

// Hide button
hideMainButton();
```

#### 4. **Back Button**
```typescript
// Show back button
showBackButton(() => {
  navigate(-1);
});

// Hide back button
hideBackButton();
```

#### 5. **Haptic Feedback**
```typescript
// Impact feedback
hapticImpact("light");   // Subtle
hapticImpact("medium");  // Normal
hapticImpact("heavy");   // Strong

// Notification feedback
hapticNotification("success");
hapticNotification("error");
hapticNotification("warning");

// Selection feedback
hapticSelection();
```

#### 6. **Dialogs**
```typescript
// Alert
showAlert("Hello from LaunchKit!");

// Confirm
showConfirm("Are you sure?", (confirmed) => {
  if (confirmed) {
    // Handle confirmation
  }
});
```

#### 7. **Safe Area Insets**
```typescript
// Get safe areas (for iOS notch, etc.)
const insets = getSafeAreaInsets();
// { top: 44, bottom: 34, left: 0, right: 0 }
```

---

## 🎨 Layout System

### Layout Component

Universal layout in `src/components/Layout.tsx`:

```typescript
<Layout
  title="Page Title"
  showBack={true}
  showMenu={false}
>
  {children}
</Layout>
```

**Features:**
- ✅ Sticky header with safe area
- ✅ Automatic back button
- ✅ Menu button (optional)
- ✅ Safe area padding (top/bottom)
- ✅ Backdrop blur effect

---

## 🎬 Page Transitions

### Framer Motion Animations

Smooth page transitions in `src/App.tsx`:

```typescript
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2, ease: "easeIn" }
  },
};
```

**Behavior:**
- New page slides in from right (x: 20 → 0)
- Old page slides out to left (0 → x: -20)
- Fade in/out (opacity: 0 → 1 → 0)
- Duration: 300ms enter, 200ms exit

---

## 📱 Screen Details

### 1. Home Screen (`/`)

**Purpose:** Main landing page with 3 action cards

**Features:**
- Hero section with welcome message
- 3 main action cards:
  - Generate Idea + Tech Spec
  - Find Team Members
  - Done-For-You Service
- Stats section (20+ freelancers, 14 days avg)
- Navigation to all main flows

**User Flow:**
```
Home → AI Chat → Idea Results → Loading → Tech Spec
Home → Marketplace
Home → DFY Form → Success
```

### 2. AI Chat Screen (`/ai-chat`)

**Purpose:** Conversation interface for idea generation

**Features:**
- Real-time chat interface
- User/assistant messages
- Loading indicator (typing dots)
- Auto-scroll to bottom
- Main Button appears after 6 messages
- Send with Enter key

**Example Conversation:**
```
AI: "What problems do you want to solve?"
User: "Task management and productivity"
AI: "Tell me about your budget and timeline"
User: "$10-20K, 3 months"
AI: "Great! Ready to see ideas?"
[Main Button: "View Ideas"]
```

### 3. Idea Results Screen (`/idea-results`)

**Purpose:** Display 3 AI-generated startup ideas

**Features:**
- 3 idea cards with:
  - Title + one-liner
  - Estimated cost, timeline
  - MVP features (first 3 shown)
  - Revenue model
- Select idea (highlight with border)
- Main Button: "Generate Tech Spec"
- Haptic feedback on selection

**Data Structure:**
```typescript
interface Idea {
  id: string;
  title: string;
  oneLiner: string;
  problem: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  estimatedCost: number;
  timelineMonths: number;
  mvpFeatures: string[];
}
```

### 4. Loading Screen (`/loading`)

**Purpose:** Animated loading during tech spec generation

**Features:**
- Pulsing sparkle icon
- Progress bar (indeterminate)
- 4 loading steps with icons:
  1. Analyzing your idea
  2. Creating technical specification
  3. Defining tech stack
  4. Finalizing details
- Auto-navigate after 8 seconds
- Smooth animations (staggered)

### 5. Tech Spec Viewer (`/tech-spec`)

**Purpose:** Display detailed technical specification

**Features:**
- Header with status badge
- Share & Download (PDF) buttons
- Key stats (Budget, Timeline, Team Size)
- MVP Features list
- Tech Stack breakdown:
  - Frontend
  - Backend
  - Database
  - AI/Services
- Next Steps card
- Main Button: "Find Team"

### 6. Team Marketplace (`/marketplace`)

**Purpose:** Browse and hire freelancers

**Features:**
- Search bar
- Role filters (All, Developer, Designer, PM, QA)
- 20 freelancer cards with:
  - Avatar (initial)
  - Name + Verified badge
  - Role title
  - Rating + projects completed
  - Location
  - Skills (badges)
  - Hourly rate
  - Availability
  - Contact button
- Haptic feedback on interactions

### 7. Done-For-You Form (`/dfy`)

**Purpose:** Request full-service launch

**Features:**
- "What's Included" section
- Form fields:
  - Project Name (required)
  - Description (required)
  - Budget Range (select)
  - Timeline (select)
  - Additional Info
- Pre-filled contact (from Telegram user)
- Form validation
- Submit with loading state
- Navigate to Success on submit

### 8. Success Screen (`/success`)

**Purpose:** Confirmation after DFY submission

**Features:**
- Animated success icon (pulsing ring)
- Success haptic on mount
- "What happens next?" info
- Actions:
  - Back to Home
  - Browse Freelancers
- Support contact link

---

## 🎨 Design System

### Theme Integration

Telegram theme params are automatically applied to CSS variables:

```css
--tg-theme-bg-color
--tg-theme-text-color
--tg-theme-hint-color
--tg-theme-link-color
--tg-theme-button-color
--tg-theme-button-text-color
--tg-theme-secondary-bg-color
```

### Safe Areas

iOS safe areas are handled with custom classes:

```css
.safe-top    { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-left   { padding-left: env(safe-area-inset-left); }
.safe-right  { padding-right: env(safe-area-inset-right); }
```

### Touch Targets

Minimum 44x44px for all interactive elements:

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### 8pt Grid

All spacing uses 8pt increments:

```css
spacing-1: 8px
spacing-2: 16px
spacing-3: 24px
spacing-4: 32px
```

---

## 🚀 Running the Mini App

### Development

```bash
cd apps/miniapp
pnpm install
pnpm dev
```

App runs at: http://localhost:3000

### Build

```bash
pnpm build
```

Output: `dist/` folder

### Deploy

```bash
# Deploy to Vercel, Netlify, or any static host
# Set build command: pnpm build
# Set output directory: dist
```

---

## 🔗 API Integration (TODO)

To connect to the API, update these files:

### 1. Create API Client (`src/lib/api.ts`)

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchAPI(endpoint: string, options = {}) {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}
```

### 2. Add Authentication (`src/hooks/useAuth.ts`)

```typescript
export function useAuth() {
  const { webApp } = useTelegram();
  
  const login = async () => {
    const initData = webApp.initData;
    
    const response = await fetchAPI("/api/v1/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ init_data: initData }),
    });
    
    localStorage.setItem("token", response.access_token);
    return response;
  };
  
  return { login };
}
```

### 3. Update Screens

Replace mock data with actual API calls in each screen.

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "framer-motion": "^10.18.0",
  "lucide-react": "^0.309.0",
  "tailwindcss": "^3.4.1",
  "zustand": "^4.4.7"
}
```

---

## ✅ Checklist

- [x] Telegram WebApp SDK integrated
- [x] useTelegram hook with all helpers
- [x] Theme params → CSS variables
- [x] Safe area support
- [x] Haptic feedback
- [x] MainButton/BackButton helpers
- [x] React Router setup
- [x] 8 screens created
- [x] Page transitions (Framer Motion)
- [x] Layout component with header
- [x] Responsive design (8pt grid)
- [x] Touch-friendly (44x44px targets)
- [x] Mock data for all screens
- [ ] API integration
- [ ] Authentication flow
- [ ] Real AI chat
- [ ] Payment integration

---

**Mini App is fully functional with complete navigation! 🎉**

