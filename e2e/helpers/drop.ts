import { readFile } from "fs/promises";
import path from "path";
import type { Locator, Page } from "@playwright/test";

import { resolveAssetPath } from "../assets";

interface DropFileData {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

/**
 * Generic Helper function that drops buffer data into element targeted by
 * locator. It uses DataTransfer object and simulates 'drop' event.
 * @param page
 * @param locator
 * @param data
 */
export const dropFile = async (
  page: Page,
  locator: Locator,
  data: DropFileData,
) => {
  const dataTransfer = await page.evaluateHandle(
    ({ buffer, fileName, mimeType }: DropFileData) => {
      const uint8Array = Uint8Array.from(Object.values(buffer));

      const dt = new DataTransfer();
      dt.items.add(new File([uint8Array], fileName, { type: mimeType }));
      return dt;
    },
    data,
  );

  await locator.dispatchEvent("drop", { dataTransfer });
};

const supportedMimeTypes = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/**
 * Helper function that drops file from assets into element targeted by
 * locator.
 *
 * @param locator - playwright locator
 * @param filePath - relative path to e2e/assets direcotry
 */
export const dropFileFromAssets = async (
  page: Page,
  locator: Locator,
  filePath: string,
) => {
  const fullFilePath = resolveAssetPath(filePath);
  const fileName = path.basename(filePath);
  const ext = path.extname(fullFilePath).toLowerCase().replace(".", "");

  if (!(ext in supportedMimeTypes)) {
    throw new Error(
      `Unsupported extension in dropped file. Only ${Object.keys(
        supportedMimeTypes,
      ).join(", ")} are supported. Got ${ext}.`,
    );
  }

  const buffer = await readFile(fullFilePath);

  return dropFile(page, locator, {
    buffer,
    fileName,
    mimeType: supportedMimeTypes[ext as keyof typeof supportedMimeTypes],
  });
};
