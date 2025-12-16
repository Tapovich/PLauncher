# 🔐 Authentication System - Complete Guide

Complete Telegram WebApp authentication with JWT tokens.

## 📊 Overview

LaunchKit AI uses Telegram WebApp authentication for seamless login:

1. **Telegram Mini App** sends `initData` to API
2. **API verifies** initData hash using bot token
3. **API upserts** user by `telegram_id`
4. **API returns** JWT access + refresh tokens
5. **Client uses** JWT for authenticated requests

---

## 🏗️ Architecture

```
┌──────────────┐        1. initData        ┌──────────────┐
│   Telegram   │  ───────────────────────► │  FastAPI     │
│   Mini App   │                            │  /api/auth/  │
│              │                            │  telegram    │
│              │  ◄───────────────────────  │              │
│              │   2. JWT tokens + user     │              │
└──────────────┘                            └──────┬───────┘
                                                   │
       3. API requests with                        │
          Authorization: Bearer <token>            │
                                                   │
┌──────────────┐        4. Validate JWT    ┌──────▼───────┐
│  Protected   │  ───────────────────────► │ get_current_ │
│  Endpoints   │                            │ user()       │
│              │  ◄───────────────────────  │ dependency   │
│              │   5. User object           │              │
└──────────────┘                            └──────────────┘
```

---

## 🔑 Authentication Flow

### Step 1: Get initData from Telegram

In the Mini App (React):

```typescript
// src/hooks/useTelegram.ts
const webApp = window.Telegram?.WebApp;
const initData = webApp.initData;

// Send to API
const response = await fetch('/api/v1/auth/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ init_data: initData })
});
```

### Step 2: Verify initData (API)

API verifies the hash using HMAC-SHA256:

```python
# app/core/telegram.py
def verify_telegram_init_data(init_data: str) -> Dict[str, str]:
    # 1. Parse initData
    # 2. Extract hash
    # 3. Calculate secret key: HMAC-SHA256("WebAppData", bot_token)
    # 4. Calculate hash: HMAC-SHA256(secret_key, data_check_string)
    # 5. Compare hashes
    # 6. Check auth_date (must be within 24 hours)
```

### Step 3: Upsert User

```python
# Get or create user by telegram_id
user = await user_service.get_user_by_telegram_id(telegram_id)

if not user:
    user = await user_service.create_user(
        telegram_id=telegram_id,
        full_name=user_data.get("full_name"),
        plan="free"
    )
```

### Step 4: Generate JWT Tokens

```python
# Create access token (30 minutes)
access_token = create_access_token({
    "sub": str(user.id),
    "telegram_id": telegram_id
})

# Create refresh token (7 days)
refresh_token = create_refresh_token({
    "sub": str(user.id),
    "telegram_id": telegram_id
})
```

### Step 5: Return Response

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "uuid",
    "telegram_id": 123456789,
    "full_name": "John Doe",
    "plan": "free",
    "created_at": "2024-12-15T10:00:00Z"
  }
}
```

---

## 📡 API Endpoints

### POST /api/v1/auth/telegram

Authenticate via Telegram WebApp.

**Request:**
```json
{
  "init_data": "query_id=AAH...&user=%7B%22id%22%3A123..."
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "uuid",
    "telegram_id": 123456789,
    "full_name": "John Doe",
    "plan": "free",
    "created_at": "2024-12-15T10:00:00Z"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid initData or expired
- `400 Bad Request` - Missing telegram_id

### GET /api/v1/auth/me

Get current user profile.

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response:**
```json
{
  "id": "uuid",
  "telegram_id": 123456789,
  "email": null,
  "full_name": "John Doe",
  "plan": "free",
  "created_at": "2024-12-15T10:00:00Z"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired token

---

## 🔒 Protected Endpoints

### Using get_current_user Dependency

```python
from fastapi import Depends
from app.api.dependencies import get_current_user
from app.models.user import User

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.id}
```

### Optional Authentication

```python
from app.api.dependencies import get_current_user_optional

@router.get("/public")
async def public_route(user: Optional[User] = Depends(get_current_user_optional)):
    if user:
        return {"message": f"Hello {user.full_name}"}
    return {"message": "Hello anonymous"}
```

---

## 🔐 JWT Token Structure

### Access Token (30 minutes)

```json
{
  "sub": "user-uuid",
  "telegram_id": 123456789,
  "exp": 1702650000,
  "iat": 1702648200,
  "type": "access"
}
```

### Refresh Token (7 days)

```json
{
  "sub": "user-uuid",
  "telegram_id": 123456789,
  "exp": 1703253000,
  "iat": 1702648200,
  "type": "refresh"
}
```

---

## 🧪 Testing Authentication

### 1. Get initData from Telegram

Use Telegram's test environment or get from browser console:

```javascript
console.log(window.Telegram.WebApp.initData);
```

### 2. Authenticate

```bash
curl -X POST http://localhost:8000/api/v1/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"init_data": "query_id=AAH...&user=%7B%22id%22%3A123..."}'
```

### 3. Use Access Token

```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Create Project (Protected)

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Project", "description": "Test project"}'
```

---

## 🔧 Configuration

### Environment Variables

```env
# JWT
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```

### Security Best Practices

1. **SECRET_KEY**: Use strong, random key (>= 32 characters)
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiry**: Access tokens expire in 30 minutes
4. **Refresh Rotation**: Implement refresh token rotation (TODO)
5. **Bot Token**: Never expose bot token to client

---

## 🛡️ Security Features

### 1. Telegram initData Verification

- ✅ HMAC-SHA256 hash verification
- ✅ Bot token as secret key
- ✅ Timestamp validation (24-hour window)
- ✅ Data integrity check

### 2. JWT Token Security

- ✅ Signed with HS256 algorithm
- ✅ Expiration time enforced
- ✅ User ID in "sub" claim
- ✅ Token type validation

### 3. Protected Endpoints

- ✅ Bearer token authentication
- ✅ Automatic user lookup
- ✅ 401 for invalid tokens
- ✅ WWW-Authenticate header

---

## 📝 Mini App Integration

### React Hook Example

```typescript
// src/hooks/useAuth.ts
import { useState } from 'react';
import { useTelegram } from './useTelegram';

export function useAuth() {
  const { webApp } = useTelegram();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async () => {
    const initData = webApp.initData;
    
    const response = await fetch('/api/v1/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_data: initData })
    });
    
    const data = await response.json();
    
    // Store token
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    
    // Store user
    setUser(data.user);
    
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, token, login, logout };
}
```

### API Client with Auth

```typescript
// src/lib/api.ts
export async function fetchAPI(endpoint: string, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return response.json();
}
```

---

## 🚧 TODO / Future Enhancements

- [ ] Refresh token rotation (blacklist old tokens)
- [ ] Email/password authentication
- [ ] OAuth2 providers (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Session management (logout all devices)
- [ ] Rate limiting per user
- [ ] API key authentication (for integrations)
- [ ] Webhook signature verification

---

## 🐛 Troubleshooting

### "Invalid Telegram authentication data"

**Cause:** initData hash verification failed

**Solutions:**
1. Check `TELEGRAM_BOT_TOKEN` is correct
2. Ensure initData is not modified
3. Verify initData is fresh (< 24 hours)

### "Invalid token: missing user ID"

**Cause:** JWT token missing "sub" claim

**Solutions:**
1. Re-authenticate to get new token
2. Check token generation includes user ID

### "User not found"

**Cause:** User was deleted after token was issued

**Solutions:**
1. Re-authenticate to create new user
2. Check database for user existence

### 401 on Protected Endpoints

**Cause:** Missing or invalid Authorization header

**Solutions:**
1. Include header: `Authorization: Bearer <token>`
2. Verify token is not expired
3. Check token format (should start with "eyJ")

---

## 📚 Resources

- [Telegram WebApp Authentication](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- [JWT.io](https://jwt.io/) - Token debugger
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [python-jose Documentation](https://python-jose.readthedocs.io/)

---

**Authentication system is production-ready and secure! 🔐**

