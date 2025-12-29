# Auth

Authentication package for Next.js applications using Supabase.

## Features

- 🔐 Complete authentication flows
- 📱 Responsive auth forms
- 🎨 Customizable UI components
- 🔄 Password reset flow
- ✉️ Email verification
- 🔒 Protected routes
- 🎯 Turnstile integration for bot protection

## Prerequisites

This package requires:

- Next.js application
- Supabase project
- `@tonik/supabase` package

## Installation

To add authentication to your Next.js application:

```bash
# From your project root
pnpm boring-stack add auth v1.0.0
```

This will:

1. Add required dependencies to your application
2. Set up necessary auth components and configurations
3. Add authentication routes

## Usage

### Protected middleware

Turbo generator will create a middleware that you can use to protect whole routes.

### Protect Routes

Turbo generator will create a tRPC endpoints at `api.auth` that you can use to
protect routes in your application.

### Auth Components

Turbo generator will create a ready auth components in the Nextjs application.
You can edit them to fit your needs.

## License

See LICENSE file in the repository root.
