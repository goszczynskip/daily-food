"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { BasicPageNav, BasicPageNavItem } from "@tonik/ui/recipes/basic-page";

const Navigation = () => {
  const segment = useSelectedLayoutSegment();
  return (
    <BasicPageNav>
      <BasicPageNavItem href="/" isActive={!segment}>
        Home
      </BasicPageNavItem>
      <BasicPageNavItem href="/about" isActive={segment === "about"}>
        About
      </BasicPageNavItem>
      <BasicPageNavItem href="https://github.com/tonik/boring-stack">
        Github
      </BasicPageNavItem>
    </BasicPageNav>
  );
};

export { Navigation };
