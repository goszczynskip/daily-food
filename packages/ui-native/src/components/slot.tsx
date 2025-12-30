import * as React from "react";
import { View } from "react-native";

export interface SlotProps extends View {
  asChild?: boolean;
  children?: React.ReactNode;
  id?: string;
}

export const Slot = React.forwardRef<View, SlotProps>(
  ({ asChild, children, ...props }, ref) => {
    const Component = asChild
      ? React.isValidElement(children)
        ? children.type
        : View
      : View;

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        ...props,
      } as React.ComponentProps<typeof View>);
    }

    return (
      <View ref={ref} {...props}>
        {children}
      </View>
    );
  },
);

Slot.displayName = "Slot";
