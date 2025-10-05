# Security Assessment – CapsuleDB

| Severity | Issue | Location | Summary |
| --- | --- | --- | --- |
| Critical | Client-side authentication can be bypassed | `src/components/auth/auth-provider.tsx` L27-L39, `src/app/login/page.tsx` L26-L39 | Login state is stored and trusted solely on the client. Any user can set `localStorage.isAuthenticated = 'true'` to unlock the app without knowing the code. |
| Critical | All API routes lack authentication/authorisation | `src/app/api/orders/route.ts` L10-L302, `src/app/api/orders/[id]/route.ts` L7-L177`, `src/app/api/worklogs/route.ts` L10-L262` and similar API handlers | Every REST endpoint can be invoked anonymously, enabling data exfiltration and modification. Attackers can read, modify, or delete any production/worklog records. |
| Medium | Request bodies with sensitive production data are logged | `src/app/api/orders/route.ts` L186-L205 | Debug logging prints entire payloads (customer data, formula details) to server logs. Compromised logs expose sensitive information. |

---

## Findings & Recommendations

### 1. Client-side authentication can be bypassed (Critical)
- **Files:** `src/components/auth/auth-provider.tsx` L27-L39, `src/app/login/page.tsx` L26-L39
- **Risk:** Authentication relies exclusively on checking a hardcoded code (`2356`) in the browser and then writing to `localStorage`. Attackers can simply run `localStorage.setItem('isAuthenticated','true')` to gain full access. There is no server-side session, password hashing, or rate limiting.
- **Remediation:** Move authentication to a secure server endpoint, store credentials hashed in the database, and issue an HttpOnly session cookie. The client should call an API that validates the code/password server-side. Example:

```ts
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const response = NextResponse.json({ success: true })
  response.cookies.set('session', createSignedSession(user.id), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  })
  return response
}
```

The React context should then check the presence of a secure cookie or call a `/api/auth/me` endpoint rather than reading from `localStorage`.

### 2. API routes lack authentication/authorisation (Critical)
- **Files:** `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`, `src/app/api/worklogs/route.ts`, and other handlers under `src/app/api`
- **Risk:** None of the REST endpoints verify the caller. Anonymous users can issue GET/POST/PUT/DELETE requests to view or manipulate production data, perform mass exports, or delete records. This is both an access-control failure (OWASP A01: Broken Access Control) and sensitive data exposure.
- **Remediation:** Enforce authentication in a shared middleware (e.g., `middleware.ts`) that validates the session cookie for all API routes. Also implement authorisation checks per resource. Example middleware snippet:

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

const PROTECTED_PATHS = ['/api']

export async function middleware(request: NextRequest) {
  if (PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !verifySession(sessionCookie)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }
  return NextResponse.next()
}
```

Within each handler, confirm that the authenticated user has permission to access the requested record (e.g., tenant or role checks). Log rejected attempts and consider rate limiting.

### 3. Sensitive payload logging (Medium)
- **File:** `src/app/api/orders/route.ts` L186-L205
- **Risk:** Debug logs print entire request bodies, including customer names, product details, ingredient lists, and remarks. In production, logs can be harvested by insiders or attackers, violating confidentiality requirements.
- **Remediation:** Remove or sanitise verbose logs before deploying. Only log high-level metadata (request ID, user ID, error code). Example:

```ts
// Bad
console.log('Request body:', body)

// Good
console.log('POST /api/orders – payload received', { customerName: body.customerName })
```

Additionally, configure structured logging with redaction for sensitive fields.

---

## Additional Recommendations
- Implement server-side rate limiting on login and data-modifying endpoints to mitigate brute force attempts.
- Once you introduce cookie-based auth, add CSRF protection (e.g., NextAuth’s built-in CSRF tokens or custom double-submit tokens) for state-changing requests.
- Establish centralised auditing: log successful/failed logins, data exports, and destructive operations with user identifiers.
- Regularly run dependency and vulnerability scans, and keep Prisma/Next.js patched.


