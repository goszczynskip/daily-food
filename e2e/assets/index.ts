import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const assetsDir = __dirname;

export const resolveAssetPath = (filePath: string) =>
  path.resolve(__dirname, filePath);

/**
 * Put there your assets mappers along with actual files
 * Example:
 *
 * export const getSomeFilePath = () =>
 *   path.resolve(__dirname, "./some-test-asset.pdf");
 */
