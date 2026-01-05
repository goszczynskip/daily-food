import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import type { ComponentProps } from "react";
import * as React from "react";
import { render } from "@react-email/components";

import { MagicLinkEmail } from "../src/emails/auth/magic-link";

const TEMPLATES = [
  {
    name: "magic-link",
    component: <MagicLinkEmail />,
    outputPath: "supabase/templates/magic_link.html",
    props: {
      token: "{{ .Token }}",
      siteUrl: "{{ .SiteURL }}",
    } satisfies ComponentProps<typeof MagicLinkEmail>,
  },
] as const;

async function exportTemplates() {
  const rootDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "..",
  );

  try {
    for (const template of TEMPLATES) {
      let html = await render(template.component);
      // Restore quotes that React escapes as &quot; inside Go template blocks {{ }}
      html = html.replace(/\{\{([^}]*?)&quot;([^}]*?)\}\}/g, (match) =>
        match.replace(/&quot;/g, '"'),
      );

      const outPath = path.resolve(rootDir, template.outputPath);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, html, "utf-8");

      console.log(`Exported: ${outPath}`);
    }

    console.log("\nDone! Commit the html-exports/ changes.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

exportTemplates().catch(console.error);
