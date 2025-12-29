import type { VariantProps } from "class-variance-authority";
import { ChevronLeft } from "lucide-react";

import type { badgeVariants } from "../badge";
import { Badge } from "../badge";
import { Button } from "../button";
import { Spinner } from "../spinner";

interface BaseProps {
  children?: React.ReactNode;
}

export const Content = ({ children }: BaseProps) => {
  return (
    <div className="mx-auto grid w-full max-w-236 flex-1 auto-rows-max gap-4">
      {children}
    </div>
  );
};

export const BackButton = () => {
  return (
    <Button variant="outline" size="icon" className="h-7 w-7">
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Back</span>
    </Button>
  );
};

export const Title = ({ children }: BaseProps) => {
  return (
    <h1 className="flex-1 shrink-0 text-xl font-semibold tracking-tight whitespace-nowrap sm:grow-0">
      {children}
    </h1>
  );
};

interface StatusBadgeProps extends BaseProps {
  statusVariant?: VariantProps<typeof badgeVariants>["variant"];
}

export const StatusBadge = ({ children, statusVariant }: StatusBadgeProps) => (
  <Badge variant={statusVariant} className="ml-auto sm:ml-0">
    {children}
  </Badge>
);

export const ContentHeader = ({ children }: BaseProps) => {
  return <div className="flex items-center gap-4">{children}</div>;
};

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  pending?: boolean;
}

export const ActionButton = ({
  pending,
  children,
  ...props
}: ActionButtonProps) => {
  const childrenWithPending = pending ? (
    <>
      <Spinner />
      {children}
    </>
  ) : (
    children
  );
  return (
    <Button disabled={pending} size="sm" {...props}>
      {childrenWithPending}
    </Button>
  );
};

export const ContentHeaderActions = ({ children }: BaseProps) => {
  return (
    <div className="hidden items-center gap-2 md:ml-auto md:flex">
      {children}
    </div>
  );
};

export const ContentBody = ({ children }: BaseProps) => (
  <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
    {children}
  </div>
);

export const MainColumn = ({ children }: BaseProps) => (
  <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
    {children}
  </div>
);

export const AsideColumn = ({ children }: BaseProps) => (
  <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
    {children}
  </div>
);
