# Notification System Design – Campus Notifications Frontend

## 1. Overview

This is a React-based campus notification management frontend built for the Affordmed evaluation platform. The application fetches, displays, and filters notifications from a centralized backend API while maintaining comprehensive logging of all user and system interactions.

**Key Capabilities:**
- Real-time notification retrieval with pagination
- Notification type filtering (Result, Placement, Event)
- Client-side event logging and monitoring
- Responsive design for desktop and mobile

---

## 2. System Requirements

### Functional
- Retrieve and display notifications from `http://20.207.122.201/evaluation-service/notifications`
- Support filtering by notification type with dropdown selector
- Implement pagination controls (Previous/Next) with configurable page size (5, 10, 20)
- Display loading, error, and empty states appropriately
- Log all system events to `http://20.207.122.201/evaluation-service/logs`

### Non-Functional
- End-to-end TypeScript type safety
- WCAG-compliant semantic HTML structure
- Mobile-responsive layout with graceful degradation
- Zero external UI framework dependencies

---

## 3. Architecture

**Layered component model:**

```
Application Layer (App.tsx)
         ↓
Custom Hook Layer (useNotifications)
         ↓
Service Layer (notificationService + logger)
         ↓
HTTP Layer (fetch API)
         ↓
Backend Services
```

This separation of concerns ensures testability, maintainability, and reusability across the application.

---

## 4. Project Structure

```
notification_app_fe/
├── src/
│   ├── components/
│   │   ├── Notification.tsx        (Card component)
│   │   └── NotificationList.tsx    (List container)
│   ├── hooks/
│   │   └── useNotifications.ts     (State & fetch logic)
│   ├── services/
│   │   └── notificationService.ts  (API client)
│   ├── utils/
│   │   └── logger.ts               (Logging utility)
│   ├── App.tsx                     (Main controller)
│   └── App.css                     (Responsive styles)
├── package.json                    (Dependencies)
└── index.html

logging_middleware/
└── logger.ts                        (Shared logging interface)
```

---

## 5. API Integration

### Notifications Endpoint
**GET** `http://20.207.122.201/evaluation-service/notifications`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| notification_type | string | No | Type filter: Result, Placement, Event |

**Authorization:** `Bearer <access_token>` header required

**Response Format:**
```json
{
  "data": [
    { "id": "...", "type": "Result", "message": "...", "createdAt": "..." }
  ]
}
```

### Logging Endpoint
**POST** `http://20.207.122.201/evaluation-service/logs`

| Field | Type | Description |
|-------|------|-------------|
| stack | string | Layer: "web", "backend", "frontend", etc. |
| level | string | Severity: "debug", "info", "warn", "error" |
| package | string | Source module |
| message | string | Event description |

**Authorization:** `Bearer <access_token>` header required

---

## 6. Authentication & Token Management

**Token Flow:**
1. User obtains `access_token` (from OAuth/evaluation provider)
2. Token stored in browser `localStorage` under key: `access_token`
3. All API requests include: `Authorization: Bearer <token>`

**Error Handling:**
- Missing token: Application displays "Missing access_token" error
- Invalid token: API responds with 401; caught and logged
- Expired token: User re-authenticates and updates localStorage

**Security Note:** Tokens are **not committed** to source control; evaluation environment only.

---

## 7. Logging Middleware Architecture

**Log Function Signature:**
```typescript
Log(stack: Stack, level: Level, pkg: PackageName, message: string): Promise<void>
```

**Behavior:**
- Asynchronous POST to logging API with Bearer token
- Graceful failure: logs to console if token missing or network unavailable
- JSON response parsing with fallback to raw text
- No error throws; all failures logged internally

**Logged Events:**
- **App initialization:** App load confirmation
- **API lifecycle:** Fetch start, success (with count), failure (with status)
- **User interactions:** Filter changes, pagination, limit changes
- **Errors:** Token missing, network failures, parse errors

---

## 8. Data Flow: Notification Retrieval

```
User clicks "Load" or Changes Filter/Page
         ↓
useNotifications Hook Triggered
         ↓
Log: "Fetch started"
         ↓
notificationService.getNotifications({page, limit, type})
         ↓
Construct URL with query params
Set Authorization header with token
Fetch from API
         ↓
Parse JSON response (or handle parse error)
         ↓
Log: "Fetch success" or "Fetch error"
         ↓
Update state: notifications[], loading, error
         ↓
React re-renders NotificationList with results
```

---

## 9. Pagination & Filtering Strategy

**Pagination:**
- Page number tracked in `useNotifications` state
- Previous button disabled when `page === 1`
- Next button increments page; no upper bound enforced (backend may return empty)
- Page resets to 1 on filter or limit change

**Filtering:**
- Dropdown selector with options: All, Result, Placement, Event
- "All" maps to `undefined` (no notification_type param)
- Specific type maps to query param `notification_type=<Type>`
- Resetting page prevents offset errors

**State Management:**
```typescript
page: number
setPage: (n: number) => void
limit: number (5 | 10 | 20)
setLimit: (n: number) => void
notificationType: string | undefined
setNotificationType: (t: string | undefined) => void
```

---

## 10. Error Handling Strategy

| Error Scenario | Detection | UI Response | Logging |
|---|---|---|---|
| Missing token | Check `localStorage` | Render error message | Log: "Missing access_token" |
| Network failure | fetch() rejection | Render error message | Log: "Network error" |
| API 4xx/5xx | response.ok === false | Render error message with status | Log: "API error {status}" |
| Empty result set | notifications.length === 0 | Render "No notifications found" | Log: "Fetch success, 0 items" |
| Parse error | JSON.parse() throws | Fallback to raw text | Log: "Parse error" |

**User Experience:**
- Errors display in designated error section
- Loading state shown during fetch
- Previous data remains visible until new fetch completes
- Clear, actionable error messages

---

## 11. Responsive UI Design

**Mobile-First Approach:**

| Breakpoint | Layout | Cards |
|---|---|---|
| <600px | Single column, stacked controls | 1 per row |
| 600px–1000px | Flex wrap controls | 1 per row |
| >1000px | Horizontal controls layout | 2 per row (grid) |

**Components:**
- **Notification Card:** Badge with type, message, timestamp; semantic `<article>` tag
- **Controls:** Dropdown filters + pagination buttons; responsive flexbox
- **Container:** Max-width 980px; padding adjusts per breakpoint

**CSS Architecture:**
- No external UI libraries
- Pure CSS with CSS Grid and Flexbox
- CSS variables for theming (colors, shadows, spacing)
- Semantic color-coding for notification types

---

## 12. Testing & Validation

**Manual Acceptance Criteria:**
1. ✓ Notifications load on page open (with valid token)
2. ✓ Filter dropdown changes notification set without page jump
3. ✓ Pagination increments page; Previous disabled on page 1
4. ✓ Limit selector changes per-page count, resets to page 1
5. ✓ Log entries appear in network tab (POST /logs with 200/201)
6. ✓ Error states render correctly (missing token, API failure, empty result)
7. ✓ UI is responsive on mobile (tested at 375px) and desktop (tested at 1920px)

**Implementation Testing:**
- Service layer: Mock fetch; verify query params, headers, token presence
- Hook layer: Mock service; verify state transitions (loading → success/error)
- Component layer: Render with test data; verify card structure and list mapping

---

## 13. Security & Compliance

**Data Protection:**
- Access token stored **only in localStorage**, never hardcoded or committed
- All API calls use HTTPS in production environment
- Bearer token included in Authorization header for every request
- No sensitive data logged (tokens, personal info)

**Code Security:**
- No inline secrets in source
- Input validation on filter/pagination params
- XSS prevention: notification message content treated as text (no HTML injection)
- CSRF: Mitigated by backend validation of Origin header

**Operational Security:**
- Credentials required before feature access
- API rate-limiting handled by backend
- Logs forwarded to centralized endpoint; no local file storage

---

## 14. Deployment & Operations

**Build & Run:**
```bash
npm install
npm run dev      # Development server on localhost:5173
npm run build    # Production bundle
```

**Environment:**
- Node.js 18+
- React 19.x, React DOM 19.x
- TypeScript 6.0.x
- Vite 8.0.x

**Scaling Considerations:**
- Notification count: No client-side pagination limit; backend handles via `limit` param
- Logging volume: Batching could be added if logs exceed 100+ per minute
- Token refresh: Add automatic refresh 5 min before expiry if backend supports

---

## Conclusion

This notification system implements a production-ready frontend architecture with clear separation between presentation, state management, and data access layers. The integration with the Affordmed evaluation backend is secure, well-logged, and resilient to common failure modes. The responsive UI ensures usability across devices, while TypeScript provides compile-time safety throughout the codebase.

**Result:** Scalable, maintainable, observable notification management system ready for deployment and monitoring.
