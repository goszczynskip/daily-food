import { Img } from "@react-email/components";
import { cn } from "../lib/utils";
import { t } from "./lang";

export const Logo = ({
  siteUrl,
  className,
  ...rest
}: {
  siteUrl: string;
  className?: string;
} & Parameters<typeof Img>[0]) => {
  return (
    <Img
      alt={t({
        en: "Daily Food logo",
        pl: "Logo Daily Food"
      })}
      className={cn("h-10 w-auto", className)}
      src={`${siteUrl}/images/email-assets/df-logo.svg`}
      {...rest}
    />
  );
};
