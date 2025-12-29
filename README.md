# Tonik's Boring Stack 🥱

Welcome to the Tonik's Boring Stack, a foundation-focused toolkit built on top of [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) with additional features and opinionated choices. This stack emphasizes robust architecture while maintaining rapid development capabilities, perfect for projects that need to move fast but grow reliably. While [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) provides an excellent foundation, we've enhanced it with additional tools and practices specifically chosen to support scalable MVP development without compromising on production-readiness.

Built with offline-first principles and seamless deployment workflows, it supports ephemeral environments through Supabase branching and Vercel preview deployments. The stack includes comprehensive end-to-end testing with Playwright, ensuring your applications remain reliable as they evolve.

Whether you need a lean setup for a quick prototype or a feature-rich application, our CLI allows you to extend the stack precisely to your needs with [optional features](#optional-features). Get started with a solid foundation that grows with your project, from MVP to production-ready application.

## Prerequisites

To start working locally you'll need:

- [Node.js](https://nodejs.org/en/download/) 22+ - JavaScript runtime
- [pnpm](https://pnpm.io/installation) 9+ - Fast, disk space efficient package manager
- [Docker](https://docs.docker.com/get-docker/) (used for local Supabase) - Container platform

## Installation

> (Coming soon) One command deployment via `npx stplr`. [Check the documentation](https://stplr.dev/docs) for more information.

1. Run command below to clone the repository. It contains all the code required including CLI integration to add optional features:

   ```bash
   git clone https://github.com/tonik/boring-stack.git
   ```

1. Run the install command:

   ```bash
   pnpm install
   ```

1. Start the development server. Note: Initial startup may take several minutes while downloading Supabase containers (~5GB):

   ```bash
   pnpm dev
   ```

The app will be available at <http://localhost:3000>.

## Features

- 🚀 Next.js: The backbone of our setup, delivering server-rendered React applications with lightning speed and SEO-friendly performance.
- 🎨 Tailwind CSS: Craft beautiful interfaces effortlessly with a utility-first CSS framework that supercharges your design workflow.
- 🛡️ ESLint & Prettier: Keep your code clean, consistent, and bug-free with powerful linting and formatting tools.
- 🔧 TypeScript: Experience the joy of a statically-typed language, ensuring type safety and catching errors early in development.
  ⚡ tRPC: Build end-to-end typesafe APIs with ease, enabling seamless communication between your frontend and backend.
- 📦 Turborepo: Manage your monorepo like a pro with powerful tools for building, testing, and deploying multiple packages.
- 🗄️ Supabase: Utilize a powerful backend-as-a-service, providing you with a Postgres database, authentication, and real-time capabilities.
- 🌐 Shadcn: Create modern and stylish UI components that elevate your user experience.
- 🛡️ Zod: Define and validate your schemas effortlessly with a TypeScript-first schema declaration and validation library.

## Optional Features

- 📝 Payload CMS: A powerful headless CMS for flexible content management. Generate a complete blog example with one command, featuring SEO metadata, form handling, Supabase media storage, live preview, categories, rich text editing, custom blocks, and more.
- 🔐 Supabase Auth: Enable user authentication with Supabase, providing secure and seamless login functionality. Generate custom auth components with a single command, including login, signup, and password reset forms. Includes support for Cloudflare CAPTCHA, theming, and logging. Fully integrated with Supabase, tRPC, and Next.js - works without additional configuration.
- (Coming soon) Supabase Auth + Payload CMS Auth integration: Use Payload CMS UI to manage user roles and permissions, and automatically restrict access to content based on user roles. Keep all user data in Supabase Auth using all of the existing features.
- (Coming soon) Resend + react-email templates: Generate email templates with react-email and send them via Resend. Use Payload CMS to manage email templates and send them to users.
- (Coming soon) Payments: Easily integrate Stripe payments with Payload CMS. Manage products, subscriptions, and payments with Payload CMS UI.

## Scripts

### Everyday usage

- `pnpm dev`: Starts the development server.
- `pnpm lint:fix`: Fixes all auto-fixable errors using eslint.
- `pnpm typecheck`: Checks types validity using typescript
- `pnpm format:fix`: Formats code with prettier.
- `pnpm e2e:ui`: Starts Playwright in UI mode. Requires development server to run in parallel.
- `pnpm test`: Run SQL db tests written in `supabase/tests`. This resets DB so all local data will be lost. To run tests without resetting DB use `pnpm db:test`.

### Specific workflows

- `pnpm generate:types`: Update Supabase types and Payload CMS types if enabled
- `pnpm generate:importmap`: Updates import map for Payload CMS if enabled
- `pnpm ui-add`: Add new Shadcn UI component
- `pnpm db:reset`: Reset the local Supabase database and run seed scripts 
- `pnpm supabase [...]`: Run supabase CLI commands. For example, `pnpm supabase migraton new` to pull the database from Supabase.

### Useful Supabase commands
- `pnpm supabase diff -f migration_name -s payload,public,storage`: Generate a migration from the current state of the database. Useful for generating migrations after changing the schema with Payload CMS.

### Cleanup scripts

- `pnpm clean`: Remove root node_modules
- `pnpm clean:workspaces`: Run clean script for all workspaces. It removes node_modules, dist folders, caches, etc.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
