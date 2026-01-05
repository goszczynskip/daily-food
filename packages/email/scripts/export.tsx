#!/usr/bin/env tsx
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import * as React from "react";
import { render } from "@react-email/components";

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
  const packageDir = path.dirname(fileURLToPath(import.meta.url));

  for (const template of TEMPLATES) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mod = await import(path.join(packageDir, "..", template.inputPath));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const Component = mod[template.component as string] as React.ElementType;

    const html = await render(React.createElement(Component, template.props));

    const cleanHtml = html
      .replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g, "")
      .replace(/\{\{ \$dot \}\}/g, "")
      .replace(/\s+data-.*?="[^"]*"/g, "");

    const outPath = path.join(packageDir, "..", template.outputPath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, cleanHtml, "utf-8");

    console.log(`Exported: ${template.outputPath}`);
  }

  console.log("\nDone! Commit the html-exports/ changes.");
}

exportTemplates().catch(console.error);
