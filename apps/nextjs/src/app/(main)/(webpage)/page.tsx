import Link from "next/link";
import { SiGithub as Github } from "@icons-pack/react-simple-icons";
import { ArrowRight, Check, Clock, Rocket, Terminal } from "lucide-react";

import { Button } from "@tonik/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tonik/ui/tabs";

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <section className="mb-12 w-full pt-12 md:mb-24 md:pt-24 lg:mb-32 lg:pt-32">
        <div className="container space-y-10 xl:space-y-16">
          <div className="grid gap-4 px-4 md:grid-cols-2 md:gap-16 md:px-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl">
                Boring Stack
              </h1>
              <p className="text-muted-foreground mt-4 text-xl">
                Production-ready T3 Stack with one command setup
              </p>
              <div className="mt-8">
                <Tabs defaultValue="stplr" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stplr">Using stplr</TabsTrigger>
                    <TabsTrigger value="manual">Manual Setup</TabsTrigger>
                  </TabsList>
                  <TabsContent value="stplr">
                    <pre className="bg-muted mb-4 rounded-lg p-4 text-lg">
                      <code>npx stplr</code>
                    </pre>
                    <p className="text-muted-foreground text-sm">
                      One command sets up your repository with Vercel, Supabase,
                      and GitHub automatically
                    </p>
                  </TabsContent>
                  <TabsContent value="manual">
                    <pre className="bg-muted mb-4 rounded-lg p-4 text-lg">
                      <code>
                        git clone https://github.com/tonik/boring-stack.git
                      </code>
                    </pre>
                    <p className="text-muted-foreground text-sm">
                      Clone the repository and set up services manually
                      following the documentation
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">What you get:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Full-stack typesafety with tRPC
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Supabase Auth & Database setup
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Automatic CI/CD with GitHub Actions
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Extensible with CLI features
                  </li>
                </ul>
              </div>
              <Button className="w-fit">
                <Link href="#get-started" className="flex items-center">
                  See How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="get-started"
        className="bg-muted w-full py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Quick Start with Stapler
          </h2>
          <div className="bg-background rounded-lg p-8 shadow-xs">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 flex items-center text-2xl font-bold">
                  <Terminal className="mr-2 h-6 w-6" />
                  Three Simple Steps
                </h3>
                <ol className="space-y-6">
                  <li className="flex items-start">
                    <span className="bg-muted mt-1 mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      1
                    </span>
                    <div>
                      <p className="mb-2 font-semibold">Run Stapler</p>
                      <pre className="bg-muted rounded-md p-3">
                        <code>npx stplr</code>
                      </pre>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-muted mt-1 mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      2
                    </span>
                    <div>
                      <p className="mb-2 font-semibold">
                        Connect Your Accounts
                      </p>
                      <p className="text-muted-foreground">
                        Follow the prompts to connect GitHub, Vercel, and
                        Supabase
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-muted mt-1 mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      3
                    </span>
                    <div>
                      <p className="mb-2 font-semibold">Start Coding</p>
                      <p className="text-muted-foreground">
                        Your project is ready with CI/CD, auth, and database set
                        up
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="mb-4 text-2xl font-bold">
                    What Happens Behind the Scenes
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      Creates GitHub repository
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      Sets up Vercel deployment
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      Configures Supabase project
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      Sets up environment variables
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      Configures GitHub Actions
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <Button>
                    <Link
                      href="https://github.com/tonik/boring-stack"
                      className="flex items-center"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Extending Your Stack
          </h2>
          <div className="bg-muted rounded-lg p-6">
            <h3 className="mb-4 text-xl font-semibold">Using CLI</h3>
            <p className="mb-4">
              Boring Stack uses CLI to extend itself. Here's how you can add new
              features:
            </p>
            <ol className="list-inside list-decimal space-y-2">
              <li>Open your terminal in the project root</li>
              <li>
                Run the command:{" "}
                <code className="bg-background rounded px-2 py-1">
                  $ pnpm boring-stack list
                </code>
              </li>
              <li>Choose a feature you want to add</li>
            </ol>
            <div className="mt-6">
              <h4 className="mb-2 text-lg font-semibold">
                Example: Adding Authentication
              </h4>
              <p>To add authentication to your project:</p>
              <pre className="bg-background mt-2 overflow-x-auto rounded-md p-4">
                <code>$ pnpm boring-stack add auth</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Available Features
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureBox
              title="Auth"
              description="Supabase auth with custom screens. Following Shadcn code style."
              status="available"
              command="boring-stack add auth"
            />
            <FeatureBox
              title="Payload"
              description="CMS with working serverless Supabase integration, locally and on production."
              status="coming-soon"
              command="boring-stack add payload"
            />
            <FeatureBox
              title="Payments"
              description="Stripe integration combined with Supabase and Payload."
              status="coming-soon"
              command="boring-stack add payments"
            />
            <FeatureBox
              title="Mailing"
              description="Resend integration with custom React emails."
              status="coming-soon"
              command="boring-stack add mailing"
            />
            <FeatureBox
              title="Background Jobs"
              description="Inngest integration with Supabase RLS permissions ready."
              status="coming-soon"
              command="boring-stack background-jobs"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 text-center md:px-6">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Want to See the Source?
          </h2>
          <p className="text-muted-foreground mb-8 text-xl">
            Check out our GitHub repository to explore the code and contribute
          </p>
          <Button size="lg">
            <Link
              href="https://github.com/your-repo/boring-stack"
              className="flex items-center"
            >
              Go to Repository
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section
        id="quick-start"
        className="bg-muted w-full py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Quick Start Guide
          </h2>
          <div className="bg-background rounded-lg p-6 shadow-xs">
            <h3 className="mb-4 flex items-center text-2xl font-bold">
              <Rocket className="mr-2 h-6 w-6" />
              Setting Up with npx stplr
            </h3>
            <p className="mb-4">
              The <code className="bg-muted rounded px-2 py-1">npx stplr</code>{" "}
              command provides a streamlined setup process:
            </p>
            <ol className="list-inside list-decimal space-y-4">
              <li>
                <strong>Initialize:</strong> Run{" "}
                <code className="bg-muted rounded px-2 py-1">npx stplr</code> in
                your terminal.
              </li>
              <li>
                <strong>Configure:</strong> Follow the interactive prompts to
                set up your project name and preferences.
              </li>
              <li>
                <strong>Connect Services:</strong> The tool will guide you
                through connecting to Vercel, Supabase, and GitHub.
              </li>
              <li>
                <strong>Deployment:</strong> Your project will be automatically
                deployed to production.
              </li>
              <li>
                <strong>Local Setup:</strong> Once complete, you'll have a local
                copy of your repository ready for development.
              </li>
            </ol>
            <p className="text-muted-foreground mt-4 text-sm">
              The entire process typically takes just a few minutes, giving you
              a fully set up and deployed Boring Stack project.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureBoxProps {
  title: string;
  description: string;
  status: "available" | "coming-soon";
  command: string;
}

const FeatureBox = ({
  title,
  description,
  status,
  command,
}: FeatureBoxProps) => (
  <div className="bg-background rounded-lg p-6 shadow-xs">
    <h3 className="mb-2 text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <span
        className={`text-sm font-medium ${status === "available" ? "text-green-500" : "text-yellow-500"}`}
      >
        {status === "available" ? (
          <span className="flex items-center">
            <Check className="mr-1 h-4 w-4" />
            Available
          </span>
        ) : (
          <span className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            Coming Soon
          </span>
        )}
      </span>
      <code className="bg-muted rounded px-2 py-1 text-sm">{command}</code>
    </div>
  </div>
);

export default HomePage;
