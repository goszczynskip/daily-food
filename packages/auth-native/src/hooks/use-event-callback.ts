import * as React from "react";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

export const useEventCallback = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
) => {
  const callbackRef = React.useRef<typeof fn>(() => {
    throw new Error("Cannot call an event handler while rendering");
  });

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = fn;
  }, [fn]);

  return React.useCallback(
    (...args: Args) => {
      const callback = callbackRef.current;
      return callback(...args);
    },
    [callbackRef],
  );
};
