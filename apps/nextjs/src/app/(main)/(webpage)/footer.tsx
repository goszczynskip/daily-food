import Link from "next/link";

const Footer = () => {
  return (
    <div className="flex">
      <p className="text-muted-foreground text-xs">
        &copy; 2024 Boring Stack. All rights reserved.
      </p>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link
          href="https://tonik.com"
          className="text-xs underline-offset-4 hover:underline"
          prefetch={false}
        >
          Made by tonik
        </Link>
      </nav>
    </div>
  );
};

export { Footer };
