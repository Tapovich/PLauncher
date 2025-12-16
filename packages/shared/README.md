# @launchkit/shared

Shared TypeScript types and contracts for LaunchKit AI monorepo.

## Usage

Import types in your app:

```typescript
import type { User, Project, StartupIdea } from "@launchkit/shared";
```

## What's included

- **User types**: User accounts and authentication
- **Project types**: Project management
- **AI types**: AI idea generation and tech specs
- **Freelancer types**: Marketplace and profiles
- **API types**: API requests, responses, and errors

## Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── ai.ts
│   │   ├── freelancer.ts
│   │   └── api.ts
│   └── index.ts
└── package.json
```

