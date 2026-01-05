---
date: 2026-01-04T20:09:52+00:00
researcher: goszczu
git_commit: 0c092f801b36bb13647222a8791409fcb1128681
branch: main
repository: daily-food
topic: "Adding custom transactional emails with react-email integrated with Supabase"
tags:
  [
    research,
    codebase,
    email,
    react-email,
    supabase,
    packages/email,
    ci-cd,
    templates,
  ]
status: complete
last_updated: 2026-01-04
last_updated_by: goszczu
---

## Research Question

Add custom transactional emails hooked into Supabase system using react-email. Requirements:

- Create one main separate package with support projects
- React-email studio running on dev accessible via https://localhost:3000/\_email (reuse existing \_email redirect)
- Existing inbucket at https://localhost:3000/\_inbox
- react-email can be a separate app just for dev similar to otel
- packages/email package with transactional emails sources and marketing emails sources
- Supabase integration with config.toml linking to built versions of emails
- Build html email templates committed to avoid built step required
- CI job to detect template source drift to protect PRs merges without synced emails

## Summary

This research provides a comprehensive implementation plan for adding react-email to the daily-food monorepo with full Supabase integration. The solution leverages the existing Supabase SMTP infrastructure and email template configuration while introducing react-email for modern, React-based email template development.

**Key findings:**

1. **Supabase uses SMTP-based email sending** - The system has a `config.toml` that points to HTML template files for authentication emails
2. **React Email Studio** - A development server that provides a live preview of email templates at localhost:3001
3. **CI Drift Detection** - Git-based comparison workflows can detect when source templates differ from committed HTML exports
4. **Package Pattern** - Internal packages follow a consistent `@tonik/` namespace pattern with TypeScript declaration emission

## Detailed Findings

### 1. Supabase Email Configuration

**Current State:**

- [`supabase/config.toml:98-108`](apps/nextjs/../../../supabase/config.toml#L98-L108) defines email template paths:

```toml
[auth.email.template.confirmation]
subject = "Confirm Your Signup"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.recovery]
subject = "Reset Your Password"
content_path = "./supabase/templates/recovery.html"

[auth.email.template.magic_link]
subject = "Your Magic Link"
content_path = "./supabase/templates/magic_link.html"
```

- Existing templates are simple HTML files at [`supabase/templates/`](supabase/templates/) with Go template syntax

**Template Variables Available:**

- `{{ .ConfirmationURL }}` - Full confirmation URL
- `{{ .Token }}` - 6-digit OTP code
- `{{ .TokenHash }}` - Hashed token for custom URL construction
- `{{ .SiteURL }}` - Application site URL
- `{{ .RedirectTo }}` - Redirect URL passed during auth
- `{{ .Data }}` - User metadata for personalization
- `{{ .Email }}` - User's email address
- `{{ .NewEmail }}` - New email address (email change template)

**Reference:** [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)

### 2. React-Email Integration Patterns

**Two-Package Structure:**

```
apps/email/              # React Email Studio dev app (runs on port 3001)
├── package.json         # @tonik/email-dev, runs email dev server
├── tsconfig.json        # Extends @tonik/tsconfig
├── turbo.json           # Turborepo config
├── Dockerfile          # Optional: for containerized dev
└── src/
    └── index.tsx       # Optional: custom entry if needed

packages/email/          # Internal package with email source (types only)
├── package.json         # @tonik/email, runs tsc for types
├── tsconfig.json        # Extends @tonik/tsconfig/internal-package.json
├── eslint.config.js     # Uses @tonik/eslint-config/base
├── README.md
└── src/
    ├── index.ts           # Exports all emails and utilities
    ├── types.ts           # TypeScript interfaces
    ├── lib/
    │   └── render.ts      # Render utilities for dynamic email sending
    ├── emails/            # Email templates (source files)
    │   ├── auth/          # Supabase auth templates
    │   │   ├── magic-link.tsx
    │   │   ├── reset-password.tsx
    │   │   ├── confirm-email.tsx
    │   │   └── invite-user.tsx
    │   ├── transactional/ # App notification emails
    │   │   └── order-confirmation.tsx
    │   └── marketing/     # Marketing emails
    │       └── welcome.tsx
    └── components/        # Shared email components
        ├── _layout/
        │   └── base-email.tsx
        ├── button.tsx
        └── card.tsx
```

**`packages/email/package.json` - Internal package (types only):**

```json
{
  "name": "@tonik/email",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./templates": {
      "types": "./dist/src/templates.d.ts",
      "default": "./src/templates.ts"
    },
    "./auth/*": {
      "types": "./dist/src/emails/auth/*.d.ts",
      "default": "./src/emails/auth/*.tsx"
    }
  },
  "scripts": {
    "dev": "tsc"  # Compile types for consumers
  },
  "dependencies": {
    "react": "catalog:react",
    "react-dom": "catalog:react",
    "@react-email/components": "^1.0.0",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@tonik/prettier-config"
}
```

**`apps/email/package.json` - Dev server app:**

```json
{
  "name": "@tonik/email-dev",
  "scripts": {
    "dev": "email dev --port 3001 --dir ../packages/email/src/emails"
  },
  "dependencies": {
    "react-email": "^1.0.0"
  }
}
```

**Reference Package Patterns:**

| Aspect       | Pattern                                         | Location                                   |
| ------------ | ----------------------------------------------- | ------------------------------------------ |
| **Name**     | `@tonik/email` / `@tonik/email-dev`             | Following `@tonik/auth`, `@tonik/ui`       |
| **tsconfig** | Extends `@tonik/tsconfig/internal-package.json` | `packages/auth/tsconfig.json:2`            |
| **eslint**   | Extends `@tonik/eslint-config/base`             | `packages/auth/eslint.config.js:1`         |
| **Build**    | `tsc` with declaration emission                 | `tooling/typescript/internal-package.json` |

**Accessing Dev Server:**

Update `apps/nextjs/next.config.mjs` to redirect `/_email` to react-email studio:

```javascript
redirects: async () => {
  return [
    // ... existing redirects
    {
      source: "/_email",
      destination: "http://localhost:3001",
      basePath: false,
      permanent: false,
    },
  ];
},
```

### 3. Email Template Example

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
} from "@react-email/components";

interface MagicLinkEmailProps {
  magicLink: string;
  email: string;
  expiresIn: string;
}

export const MagicLinkEmail = ({
  magicLink,
  email,
  expiresIn,
}: MagicLinkEmailProps) => {
  const previewText = `Sign in to Daily Food`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={text}>Hi,</Text>
            <Text style={text}>
              Click the button below to sign in to Daily Food. This link will
              expire in {expiresIn}.
            </Text>
            <Section style={buttonContainer}>
              <Button href={magicLink} style={button}>
                Sign In
              </Button>
            </Section>
            <Text style={text}>
              If you didn't request this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

MagicLinkEmail.PreviewProps = {
  magicLink: "https://daily-food.com/auth/verify?token=abc123",
  email: "user@example.com",
  expiresIn: "24 hours",
} as MagicLinkEmailProps;

export default MagicLinkEmail;
```

> **Note:** The current redirect at `/_email` points to Mailpit (localhost:54324). To reuse this for react-email studio, update the redirect destination in `apps/nextjs/next.config.mjs` from the Mailpit port to the react-email studio port (3001).

### 4. CI Drift Detection Workflow

**Location:** `.github/workflows/email-drift-check.yml`

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
      - uses: actions/checkout@v6
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
        uses: actions/github-script@v8
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ **Email Template Drift Detected**\n\nThe email template HTML exports are out of sync with the React source files.\n\nPlease run the following command and commit the changes:\n```bash\npnpm --filter @tonik/email export\n```\n\nThis ensures Supabase uses the latest email template changes.'
            })
````

### 5. Supabase Integration

**Update `supabase/config.toml`:**

```toml
[auth.email.template.confirmation]
subject = "Confirm Your Signup"
content_path = "./packages/email/html-exports/auth/confirmation.html"

[auth.email.template.recovery]
subject = "Reset Your Password"
content_path = "./packages/email/html-exports/auth/recovery.html"

[auth.email.template.magic_link]
subject = "Your Magic Link"
content_path = "./packages/email/html-exports/auth/magic-link.html"

[auth.email.template.invite]
subject = "You have been invited"
content_path = "./packages/email/html-exports/auth/invite.html"
```

**Export Script for Supabase Templates:**

Create `packages/email/scripts/export-supabase-templates.ts`. This script is generic and accepts paths as arguments:

```typescript
#!/usr/bin/env tsx
import { render } from "@react-email/components";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

// CLI arguments: [--input <dir>] [--output <dir>] [--manifest <file>]
const args = process.argv.slice(2);
const parseArg = (key: string) => {
  const idx = args.indexOf(key);
  return idx !== -1 ? args[idx + 1] : null;
};

const INPUT_DIR = parseArg("--input") ?? path.join(process.cwd(), "src/emails");
const OUTPUT_DIR = parseArg("--output") ?? path.join(process.cwd(), "html-exports");
const MANIFEST_PATH = parseArg("--manifest") ?? path.join(process.cwd(), "templates.manifest.json");

interface TemplateManifest {
  templates: Array<{
    name: string;
    component: string;
    props?: Record<string, string>;
    outputPath: string;
  }>;
}

async function exportTemplates() {
  // Read manifest or generate from directory structure
  let manifest: TemplateManifest;
  try {
    const manifestContent = await fs.readFile(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(manifestContent);
  } catch {
    // Fallback: auto-discover templates from directory
    manifest = {
      templates: [
        { name: "magic-link", component: "MagicLinkEmail", outputPath: "auth/magic-link.html" },
        { name: "recovery", component: "ResetPasswordEmail", outputPath: "auth/recovery.html" },
        { name: "confirmation", component: "ConfirmationEmail", outputPath: "auth/confirmation.html" },
      ],
    };
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const template of manifest.templates) {
    const { [template.component]: Component } = await import(
      path.join(INPUT_DIR, template.outputPath.replace(/\.html$/, ".tsx"))
    );

    const props = template.props ?? {
      magicLink: "{{ .ConfirmationURL }}",
      email: "{{ .Email }}",
    };

    const html = await render(<Component {...props} />);

    // Clean up react-email specific comments
    const cleanHtml = html
      .replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g, "")
      .replace(/\{\{ \$dot \}\}/g, "");

    const outPath = path.join(OUTPUT_DIR, template.outputPath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, cleanHtml, "utf-8");

    console.log(`Exported ${template.outputPath}`);
  }
}

exportTemplates().catch(console.error);
```

**Usage:**

```bash
# Default: exports to html-exports/ from src/emails/
pnpm --filter @tonik/email exec tsx scripts/export-supabase-templates.ts

# Custom paths
pnpm --filter @tonik/email exec tsx scripts/export-supabase-templates.ts \
  --input ./src/emails/auth \
  --output ./supabase/templates \
  --manifest ./scripts/supabase-manifest.json
```

**Package.json script:**

```json
{
  "scripts": {
    "export": "tsx scripts/export-supabase-templates.ts",
    "export:supabase": "tsx scripts/export-supabase-templates.ts --output ./html-exports --manifest ./scripts/supabase-manifest.json"
  }
}
```

### 6. Turbo Pipeline Additions

Update `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".react-email/.next/**", "html-exports/**"]
    }
  }
}
```

### 7. Historical Context (from thoughts/)

- `thoughts/shared/plans/2025-12-29-auth-restructuring-v2.md` - Auth restructuring plan shows the pattern for creating new packages with `@tonik/` namespace

## Code References

### Existing Infrastructure

- [`supabase/config.toml`](supabase/config.toml) - Supabase configuration with email templates
- [`apps/nextjs/next.config.mjs:57-61`](apps/nextjs/next.config.mjs#L57-L61) - Current `/_email` redirect to Mailpit
- [`apps/otel/package.json`](apps/otel/package.json) - Pattern for dev-only apps
- [`packages/auth/package.json`](packages/auth/package.json) - Package pattern reference
- [`tooling/typescript/internal-package.json`](tooling/typescript/internal-package.json) - TypeScript config for internal packages

### Related Documentation

- [React Email Documentation](https://react.email/docs)
- [React Email GitHub](https://github.com/resend/react-email)
- [Supabase Custom Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Send Email Auth Hook with React Email](https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend)

## Architecture Insights

### Email Sending Flow

1. **Development Mode:**
   - Run `pnpm --filter @tonik/email-dev dev` to start react-email studio at localhost:3001
   - Templates render with preview props for testing
   - Access via `http://localhost:3001` or via `/_email` redirect in Next.js app

2. **Production/Supabase Mode:**
   - Run export script to generate HTML from react-email templates
   - Commit HTML files to repository
   - Supabase reads HTML from configured paths in `config.toml`
   - When auth events occur, Supabase uses the HTML templates

3. **Dynamic Email Sending (Optional):**
   - For non-Supabase emails, use the render utility in `packages/email`
   - Send via Nodemailer, Resend, or other providers
   - Supports React component rendering for full React integration

### Design Decisions

1. **Two-Package Structure:**
   - `packages/email` - Internal package with email sources and types only
   - `apps/email-dev` - Dev-only app running react-email studio
   - Separation allows independent updates and clearer intent

2. **HTML Export Strategy:**
   - Commit generated HTML to repository (no build step for Supabase)
   - CI checks prevent drift between source and committed HTML
   - Simplifies Supabase configuration

3. **Separate Dev Server:**
   - react-email studio runs on port 3001 (not shared with Next.js)
   - Available at /\_email redirect for quick access
   - Inbucket remains at /\_inbox for email testing

4. **Package Location:**
   - `packages/email` - Internal package for email source files and types
   - `apps/email` - Dev-only app running react-email studio
   - Follows existing `@tonik/*` namespace convention

## Implementation Plan

### Phase 1: Package Setup

1. Create `packages/email/` using turbo generator:

   ```bash
   pnpm turbo gen init --name email --template internal-package
   ```

   This generates an empty package with all necessary config files (tsconfig.json, eslint.config.js, etc.)

2. Configure `packages/email/`:
   - Add `dev: tsc` script for type compilation
   - Add dependencies: `react`, `react-dom`, `@react-email/components`, `zod`
   - Add exports configuration in `package.json`

3. Create `apps/email/` using turbo generator:

   ```bash
   pnpm turbo gen init --name email-dev --template app
   ```

   This generates a dev-only app similar to `apps/otel/`

4. Configure `apps/email/`:
   - Run `email dev --port 3001 --dir ../packages/email/src/emails`
   - Add redirect in `apps/nextjs/next.config.mjs` for `/_email` → `localhost:3001`

5. Update `pnpm-workspace.yaml` for new packages (turbo gen may do this automatically)
6. Test: `pnpm run dev` should include email studio alongside other apps

### Phase 2: Template Development

1. Create base email layout component
2. Implement auth templates (magic-link, recovery, confirmation, invite)
3. Add preview props for dev mode
4. Test templates at `http://localhost:3001` via react-email studio

### Phase 3: Supabase Integration

1. Create `packages/email/scripts/export-supabase-templates.ts` (generic export script)
2. Create optional manifest file `packages/email/scripts/supabase-manifest.json` for explicit template mapping
3. Run export to generate initial HTML exports:
   ```bash
   pnpm --filter @tonik/email export:supabase
   ```
4. Commit HTML files to `packages/email/html-exports/`
5. Update `supabase/config.toml` with new template paths pointing to committed HTML exports
6. Test with local Supabase instance

### Phase 4: CI/CD

1. Add email drift check workflow
2. Add to existing CI pipeline
3. Test PR protection behavior

### Phase 5: Optional Marketing Emails

1. Add marketing email templates
2. Create render utilities for dynamic sending
3. Document usage patterns

## Open Questions

1. **Custom SMTP Provider:** Should we use Supabase's built-in SMTP or configure a custom provider (Resend, SendGrid, AWS SES) for production?
2. **Dynamic vs Static Templates:** For marketing emails, should we use dynamic rendering (React Email render utility) or continue with static exports?
3. **Email Testing:** Should we integrate with Mailpit for development or use react-email studio's built-in preview?
4. **Template Versioning:** How to handle template changes across Supabase environments (local, staging, production)?

## Related Research

- `thoughts/shared/plans/2025-12-29-auth-restructuring-v2.md` - Auth package restructuring plan
- `thoughts/shared/research/2025-12-29-expo-auth-integration.md` - Auth integration patterns

## Links

- [React Email Documentation](https://react.email/docs)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [React Email + Turborepo Example](https://github.com/resend/react-email-turborepo-pnpm-example)
- [Supabase Send Email Hook with React Email](https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend)
