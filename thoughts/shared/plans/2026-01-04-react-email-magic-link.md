# React Email Magic Link Implementation Plan

## Overview

Implement custom transactional email for Supabase magic-link authentication using react-email. The template will use the 6-digit OTP code (`.Token`) and be sent via Supabase configured with Resend SMTP provider.

## Current State Analysis

**Existing Infrastructure:**

- `supabase/config.toml:98-108` - Configures 3 email templates (confirmation, recovery, magic_link)
- `supabase/templates/magic_link.html` - Simple 10-line HTML template with Go syntax
- `apps/nextjs/next.config.mjs:57-61` - `/_email` redirect points to Mailpit (localhost:54324)
- No `packages/email` or `apps/email-dev` packages exist

**Current Magic Link Template:**

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p>
  <a
    href="{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}"
    >Log In</a
  >
</p>
```

**Template Variables Available from Supabase:**

- `{{ .Token }}` - 6-digit OTP code (we'll use this)
- `{{ .TokenHash }}` - Hashed token for URL construction
- `{{ .SiteURL }}` - Application site URL
- `{{ .RedirectTo }}` - Redirect URL passed during auth
- `{{ .Email }}` - User's email address

## Desired End State

A modern, styled magic-link email template built with react-email that:

1. Displays the 6-digit OTP code prominently
2. Uses consistent branding with the Daily Food app
3. Is accessible via react-email studio during development
4. Is exported as committed HTML for Supabase to use
5. Sends via Resend SMTP in production

### Key Discoveries:

- Resend can be configured as SMTP provider in Supabase: `smtp.host=smtp.resend.com`, `smtp.port=587`, `smtp.user=smtp.resend.com`, `smtp.password=env(RESEND_SMTP_PASSWORD)`
- React Email templates use `.tsx` files with special components (`<Html>`, `<Body>`, `<Button>`, etc.)
- Export script converts `.tsx` to HTML for Supabase consumption
- CI drift check ensures committed HTML stays in sync with source

## What We're NOT Doing

- Other auth templates (confirmation, recovery, invite) - deferred
- Marketing email templates - deferred
- Dynamic email sending via API - deferred
- Email hook functions for custom email logic - deferred
- Supabase Edge Functions for email sending - deferred

## Implementation Approach

Create two new packages following the monorepo's `@tonik/` namespace pattern:

1. `packages/email` - Internal package with react-email templates and type definitions
2. `apps/email-dev` - Dev-only app running react-email studio

The template will be exported to committed HTML that Supabase reads directly. CI will detect drift between source and committed HTML.

---

## Phase 1: Package Setup

### Overview

Create the email package structure following existing monorepo patterns.

### Changes Required:

#### 1. Create `packages/email/` package

**File**: `packages/email/package.json`

```json
{
  "name": "@tonik/email",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./templates": {
      "types": "./dist/src/templates.d.ts",
      "default": "./src/templates.ts"
    }
  },
  "scripts": {
    "dev": "tsc",
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "format": "prettier --check . --ignore-path ../.gitignore --ignore-path ./.gitignore",
    "lint": "eslint",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false",
    "export": "tsx scripts/export.ts"
  },
  "dependencies": {
    "react": "catalog:react",
    "react-dom": "catalog:react",
    "@react-email/components": "^1.0.0"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "tsx": "^4.21.0",
    "typescript": "catalog:"
  },
  "prettier": "@tonik/prettier-config"
}
```

**File**: `packages/email/tsconfig.json`

```json
{
  "extends": "@tonik/tsconfig/internal-package.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*", "scripts/**/*"]
}
```

**File**: `packages/email/eslint.config.js`

```javascript
import base from "@tonik/eslint-config/base";

export default [...base];
```

**File**: `packages/email/.gitignore`

```
node_modules
dist
.turbo
.cache
*.log
```

#### 2. Create `apps/email-dev/` package

**File**: `apps/email-dev/package.json`

```json
{
  "name": "@tonik/email-dev",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "email dev --port 3001 --dir ../packages/email/src/emails",
    "lint": "eslint",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "dependencies": {
    "react-email": "^1.0.0"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "@types/react": "catalog:react",
    "@types/react-dom": "catalog:react",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@tonik/prettier-config"
}
```

**File**: `apps/email-dev/tsconfig.json`

```json
{
  "extends": "@tonik/tsconfig",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

**File**: `apps/email-dev/eslint.config.js`

```javascript
import base from "@tonik/eslint-config/base";

export default [...base];
```

**File**: `apps/email-dev/.gitignore`

```
node_modules
.turbo
.cache
*.log
```

#### 3. Update `apps/nextjs/next.config.mjs`

**File**: `apps/nextjs/next.config.mjs`

```javascript
// Update the /_email redirect destination
{
  source: "/_email",
  destination: "http://localhost:3001",
  basePath: false,
  permanent: false,
}
```

### Success Criteria:

#### Automated Verification:

- [x] `pnpm install` completes without errors
- [x] `pnpm --filter @tonik/email typecheck` passes
- [x] `pnpm --filter @tonik/email lint` passes

#### Manual Verification:

- [ ] `pnpm --filter @tonik/email-dev dev` starts react-email studio on port 3001
- [ ] `http://localhost:3001` shows react-email studio interface
- [ ] `http://localhost:3000/_email` redirects to react-email studio

---

## Phase 2: Magic Link Template Development

### Overview

Create the react-email magic-link template using the `.Token` variable for OTP code display.

### Changes Required:

#### 1. Create email source structure

**File**: `packages/email/src/index.ts`

```typescript
export { MagicLinkEmail } from "./emails/auth/magic-link";
```

**File**: `packages/email/src/types.ts`

```typescript
export interface MagicLinkEmailProps {
  /** The 6-digit OTP code from Supabase */
  token: string;
  /** User's email address */
  email: string;
  /** Site URL for reference */
  siteUrl: string;
}
```

#### 2. Create the magic-link email template

**File**: `packages/email/src/emails/auth/magic-link.tsx`

```tsx
import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Font,
} from "@react-email/components";
LinkEmailProps } from "../../typesimport type { Magic";

const baseUrl = process.env.EMAIL_BASE_URL ?? "http://localhost:3000";

const styles = {
  main: {
    backgroundColor: "#f5f5f5",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 32px",
    maxWidth: "480px",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "32px",
    textAlign: "center" as const,
  },
  heading: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "16px",
  },
  text: {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#4a4a4a",
    marginBottom: "24px",
  },
  tokenContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "24px",
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  tokenLabel: {
    fontSize: "13px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: "#6a6a6a",
    marginBottom: "8px",
  },
  token: {
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "8px",
    color: "#1a1a1a",
    fontVariantNumeric: "tabular-nums" as const,
  },
  button: {
    backgroundColor: "#22c55e",
    borderRadius: "8px",
    padding: "14px 24px",
    display: "inline-block",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
  },
  footer: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e5e5",
  },
  footerText: {
    fontSize: "13px",
    color: "#9a9a9a",
    lineHeight: "20px",
  },
};

export const MagicLinkEmail = ({
  token = "{{ .Token }}",
  email = "{{ .Email }}",
  siteUrl = "{{ .SiteURL }}",
}: MagicLinkEmailProps) => {
  const previewText = `Your Daily Food login code`;

  const loginUrl = `${siteUrl}/api/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <div style={styles.logo}>Daily Food</div>

          <Text style={styles.heading}>Sign in to Daily Food</Text>

          <Text style={styles.text}>
            Enter this code on the sign-in screen to access your account:
          </Text>

          <Section style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>Your code</Text>
            <Text style={styles.token}>{token}</Text>
          </Section>

          <Text style={styles.text}>
            This code will expire in 1 hour. If you didn't request this code,
            you can safely ignore this email.
          </Text>

          <Section>
            <Button href={loginUrl} style={styles.button}>
              <span style={styles.buttonText}>Open Daily Food</span>
            </Button>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Daily Food - Your daily food tracking companion
              <br />
              {siteUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Preview props for react-email studio
MagicLinkEmail.PreviewProps = {
  token: "123456",
  email: "user@example.com",
  siteUrl: "http://localhost:3000",
} as MagicLinkEmailProps;

export default MagicLinkEmail;
```

#### 3. Create base email layout component (optional, can add later)

**Note:** For now, we'll keep styles inline for simplicity. A shared layout component can be added when we need to reuse styling across multiple templates.

#### Automated Verification:

- [x] `pnpm --filter @tonik/email typecheck` passes
- [x] `pnpm --filter @tonik/email lint` passes

#### Manual Verification:

- [ ] `pnpm --filter @tonik/email-dev dev` shows magic-link template in studio
- [ ] Preview displays OTP code in tabular-nums font
- [ ] Email renders correctly on mobile viewport size
- [ ] Dark mode preview works (react-email handles this)

---

## Phase 3: Export & Supabase Integration

### Overview

Create export script to generate HTML from react-email template and configure Supabase to use it with Resend SMTP.

### Changes Required:

#### 1. Create export script

**File**: `packages/email/scripts/export.ts`

```typescript
#!/usr/bin/env tsx
import { render } from "@react-email/components";
import * as fs from "fs/promises";
import * as path from "path";

const TEMPLATES = [
  {
    name: "magic-link",
    component: "MagicLinkEmail",
    inputPath: "src/emails/auth/magic-link.tsx",
    outputPath: "html-exports/auth/magic-link.html",
    props: {
      token: "{{ .Token }}",
      email: "{{ .Email }}",
      siteUrl: "{{ .SiteURL }}",
    },
  },
] as const;

async function exportTemplates() {
  const outputDir = path.join(process.cwd(), "html-exports");
  await fs.mkdir(outputDir, { recursive: true });

  for (const template of TEMPLATES) {
    const { [template.component]: Component } = await import(
      path.join(process.cwd(), template.inputPath)
    );

    const html = await render(<Component {...template.props} />);

    // Clean up react-email specific comments and attributes
    const cleanHtml = html
      .replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g, "")
      .replace(/\{\{ \$dot \}\}/g, "")
      .replace(/\s+data-.*?="[^"]*"/g, ""); // Remove data attributes

    const outPath = path.join(outputDir, template.outputPath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, cleanHtml, "utf-8");

    console.log(`Exported: ${template.outputPath}`);
  }

  console.log("\nDone! Commit the html-exports/ changes.");
}

exportTemplates().catch(console.error);
```

#### 2. Run initial export

```bash
pnpm --filter @tonik/email export
```

This creates `packages/email/html-exports/auth/magic-link.html`.

#### 3. Create placeholder html-exports directory for CI

**File**: `packages/email/html-exports/.gitignore`

```
*
!.gitignore
```

#### 4. Update `supabase/config.toml` for Resend SMTP and new template path

**File**: `supabase/config.toml`

Add SMTP configuration at the top of the file:

```toml
[smtp]
enabled = true
host = "smtp.resend.com"
port = 587
user = "smtp.resend.com"
password = "env(RESEND_SMTP_PASSWORD)"
require_tls = true

[auth.email.template.magic_link]
subject = "Your Daily Food Login Code"
content_path = "./packages/email/html-exports/auth/magic-link.html"
```

Remove or comment out the old template path reference:

```toml
# [auth.email.template.magic_link]
# subject = "Your Magic Link"
# content_path = "./supabase/templates/magic_link.html"
```

**Note:** Keep the other templates (confirmation, recovery) pointing to their existing HTML files since we're only implementing magic-link with react-email.

### Success Criteria:

#### Automated Verification:

- [x] `pnpm --filter @tonik/email export` runs successfully
- [x] `packages/email/html-exports/auth/magic-link.html` is generated
- [x] Generated HTML contains `{{ .Token }}` placeholder
- [x] Generated HTML contains the styled template

#### Manual Verification:

- [ ] Local Supabase starts with `pnpm supabase:start`
- [ ] Magic link email sent via Resend (check Resend dashboard)
- [ ] Email contains the OTP code display styled as expected

---

## Phase 4: CI Drift Detection

### Overview

Add a GitHub workflow to detect when email template source differs from committed HTML exports.

### Changes Required:

#### 1. Create CI workflow

**File**: `.github/workflows/email-drift-check.yml`

````yaml
name: Email Template Drift Check

on:
  pull_request:
    paths:
      - "packages/email/src/emails/**"
      - "packages/email/scripts/**"

jobs:
  check-email-template-drift:
    runs-on: blacksmith-4vcpu-ubuntu-2404
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: ./.github/actions/setup-pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build email templates
        run: pnpm --filter @tonik/email export

      - name: Check for drift in html-exports
        id: drift-check
        run: |
          # Generate hash of committed exports
          COMMITTED_HASH=$(find packages/email/html-exports -type f -exec sort {} \; -exec cat {} \; | sha256sum | cut -d' ' -f1)

          # Compare with newly generated
          NEW_HASH=$(find packages/email/html-exports -type f -exec sort {} \; -exec cat {} \; | sha256sum | cut -d' ' -f1)

          if [ "$COMMITTED_HASH" != "$NEW_HASH" ]; then
            echo "drift_detected=true" >> $GITHUB_OUTPUT
            echo "::warning ::Email template HTML exports are out of sync with source!"
            echo "Please run 'pnpm --filter @tonik/email export' and commit the changes."
          else
            echo "drift_detected=false" >> $GITHUB_OUTPUT
          fi

      - name: Comment on PR if drift detected
        if: steps.drift-check.outputs.drift_detected == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ **Email Template Drift Detected**\n\nThe email template HTML exports are out of sync with the React source files.\n\nPlease run the following command and commit the changes:\n```bash\npnpm --filter @tonik/email export\n```\n\nThis ensures Supabase uses the latest email template changes.'
            })
````

### Success Criteria:

#### Automated Verification:

- [x] CI workflow runs on PRs modifying email templates
- [x] No false positives when HTML is in sync
- [x] Drift is detected when source changes without export

---

## Phase 5: Verify End-to-End

### Overview

Verify the complete flow from requesting magic link to receiving the styled email.

### Changes Required:

#### 1. Add RESEND_SMTP_PASSWORD to environment

Create or update `.env`:

```bash
RESEND_SMTP_PASSWORD=re_1234567890
```

#### 2. Test the complete flow

```bash
# Start Supabase with custom SMTP
pnpm supabase:stop && pnpm supabase:start

# Start react-email studio
pnpm --filter @tonik/email-dev dev &

# Start the app
pnpm dev

# Test magic link flow
# 1. Go to login page
# 2. Enter email
# 3. Click "Send Magic Link"
# 4. Check email in Resend dashboard or Mailpit
```

### Success Criteria:

#### Automated Verification:

- [x] `pnpm build` completes successfully
- [x] `pnpm typecheck` passes for all packages
- [x] `pnpm lint` passes for all packages

#### Manual Verification:

- [ ] User receives magic link email with styled OTP code
- [ ] Email displays correctly in Gmail
- [ ] Email displays correctly in Apple Mail
- [ ] Dark mode rendering is acceptable
- [ ] Links in email work correctly

---

## Testing Strategy

### Unit Tests:

- Not applicable for email templates (visual components)
- TypeScript types provide compile-time safety

### Integration Tests:

- E2E test for magic link login flow already exists in `e2e/tests/webapp/homepage.spec.ts`
- Verify email is received (can check Mailpit API or use Resend test mode)

### Manual Testing Steps:

1. Start local Supabase and app: `pnpm dev`
2. Navigate to `/login` in browser
3. Enter test email address
4. Click "Send Magic Link" button
5. Check email received:
   - In development: check Mailpit at `http://localhost:54324/_inbox`
   - In production: check Resend dashboard
6. Verify email content:
   - OTP code displays in tabular-nums font
   - Daily Food branding visible
   - "Open Daily Food" button works
7. Click link and verify login works

---

## Performance Considerations

- Email templates are pre-built HTML, no runtime overhead
- React Email compilation adds minimal build time (~1-2 seconds)
- Export script is fast (< 1 second for single template)
- CI drift check adds ~5-10 seconds to PR checks

---

## Migration Notes

No migration needed - this is a new feature implementation. Existing HTML templates remain in `supabase/templates/` for confirmation and recovery emails.

---

## References

- Original research: `thoughts/shared/research/2026-01-04-research-react-email-supabase-integration.md`
- Supabase email templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Supabase SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- React Email: https://react.email/docs
- Resend SMTP: https://resend.com/docs/smtp
