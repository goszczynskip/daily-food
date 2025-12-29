import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ora from "ora";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "../");

async function ensureDotEnv() {
  try {
    await fs.access(".env", fs.constants.F_OK);
  } catch {
    console.log("Creating .env file");
    fs.copyFile(
      path.join(monorepoRoot, ".env.example"),
      path.join(monorepoRoot, ".env"),
    );
  }
}

const abortController = new AbortController();
let activeProcesses: ReturnType<typeof spawn>[] = [];

class TerminalError extends Error {
  stderr?: string;
  stdout?: string;
}

async function ensureSupabaseStart() {
  const spinner = ora("Checking if supabase is running").start();

  const runSupabaseCommand = (args: string[]) =>
    new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      const process = spawn("pnpm", ["supabase", ...args], {
        stdio: ["inherit", "pipe", "pipe"],
        signal: abortController.signal,
        cwd: monorepoRoot,
      });

      activeProcesses.push(process);

      let stdout = "";
      let stderr = "";

      process.stdout.on("data", (data) => {
        const message = data.toString();
        stdout += message;
        spinner.text = message.trim();
      });

      process.stderr.on("data", (data) => {
        const message = data.toString();
        stderr += message;
        spinner.text = message.trim();
      });

      process.on("error", (error) => {
        spinner.fail();
        console.error("Process error:", error.message);
        console.error("stderr:", stderr);
        reject(error);
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          const error = new TerminalError(`Process exited with code ${code}`);
          error.stderr = stderr;
          error.stdout = stdout;

          reject(error);
        }
      });
    });

  try {
    await runSupabaseCommand(["status"]);

    spinner.succeed("Supabase is running");
  } catch (error) {
    if (error instanceof TerminalError) {
      if (error.stderr?.includes("No such container")) {
        spinner.info("Supabase containers not found");

        spinner.start("Starting Supabase containers...");
        await runSupabaseCommand(["start"]);
        spinner.succeed("Supabase containers started successfully");
        return;
      }

      if (
        error.stdout?.includes("supabase local development setup is running")
      ) {
        spinner.succeed("Supabase is running");
        return;
      }
      spinner.fail();
      console.error(error.stderr);
    } else {
      spinner.fail();
    }

    if (error instanceof Error) {
      console.error("Error:", error.message);
    }

    throw error;
  }
}

let stopping = false;

async function cleanup(signal: NodeJS.Signals = "SIGTERM") {
  const spinner = ora("Shutting down processes...").start();

  try {
    const processesToWaitFor = activeProcesses.map(
      (process) =>
        new Promise((resolve) => {
          if (process.exitCode !== null) {
            resolve(process.exitCode);
            return;
          }

          process.on("exit", resolve);
          process.on("error", resolve);

          process.kill(!stopping ? signal : "SIGKILL");
        }),
    );

    abortController.abort();

    await Promise.all(processesToWaitFor);

    spinner.fail("All processes terminated");
    process.exit(1);
  } catch (error) {
    spinner.fail("Error during cleanup");
    if (error instanceof Error) {
      console.error("Cleanup error:", error.message);
    }
    process.exit(1);
  } finally {
    stopping = true;
  }
}

// Handle process termination signals
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP"];
signals.forEach((signal) => {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}`);
    cleanup();
  });
});

async function runTurboDev() {
  const subprocess = spawn(
    "pnpm",
    ["turbo", "watch", "dev", "--continue", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      signal: abortController.signal,
      cwd: monorepoRoot,
    },
  );

  activeProcesses.push(subprocess);

  return new Promise((resolve, reject) => {
    subprocess.on("error", (error) => {
      console.error("Turbo dev error:", error.message);
      reject(error);
    });

    subprocess.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Turbo dev exited with code ${code}`));
      }
    });
  });
}

/**
 * Run all the necessary steps to start the development environment
 * 1. copy .env.example to .env if it doesn't exist
 * 2. Ensure supabase is running. If not, start it
 * 3. Run turbo dev
 *
 * It supports cleanup on process termination signals
 * Uses Ora spinner for nicer output
 */
async function main() {
  try {
    await ensureDotEnv();
    await ensureSupabaseStart();
    await runTurboDev();
  } catch (error) {
    await cleanup();
  }
}

await main();
