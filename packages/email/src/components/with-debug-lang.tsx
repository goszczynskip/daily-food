import React from "react";

import { DebugLangProvider } from "./lang";

export function withDebugLang<P extends object>(
  Component: React.ComponentType<P>,
  defaultDebugLang?: string | null,
) {
  const WrappedComponent = function WithDebugLangComponent(
    props: P & { debugLang?: string | null },
  ) {
    const debugLang = props.debugLang ?? defaultDebugLang ?? null;
    return (
      <DebugLangProvider value={{ debugLang }}>
        <Component {...(props as P)} />
      </DebugLangProvider>
    );
  };

  // Preserve static properties like PreviewProps
  Object.setPrototypeOf(WrappedComponent, Component);
  Object.getOwnPropertyNames(Component).forEach((name) => {
    if (name !== "prototype" && name !== "name" && name !== "length") {
      (WrappedComponent as any)[name] = (Component as any)[name];
    }
  });

  return WrappedComponent as React.ComponentType<
    P & { debugLang?: string | null }
  >;
}
