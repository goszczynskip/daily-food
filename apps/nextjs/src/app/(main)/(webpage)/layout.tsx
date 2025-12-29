import "server-only";

import type { ReactNode } from "react";

import {
  BasicPage,
  BasicPageContent,
  BasicPageFooter,
  BasicPageHeader,
} from "@tonik/ui/recipes/basic-page";
import { Logo } from "@tonik/ui/recipes/logo";
import { ThemeToggle } from "@tonik/ui/theme";

import { NavAuth } from "../_components/nav-auth";
import { Footer } from "./footer";
import { Navigation } from "./nav";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <BasicPage>
      <BasicPageHeader>
        <div className="flex-1">
          <Logo />
        </div>
        <Navigation />
        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          <NavAuth />
        </div>
      </BasicPageHeader>
      <BasicPageContent>{children}</BasicPageContent>
      <BasicPageFooter>
        <Footer />
      </BasicPageFooter>
    </BasicPage>
  );
};

export default Layout;
