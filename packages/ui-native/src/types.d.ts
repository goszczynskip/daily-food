import "react-native";

declare module "react-native" {
  interface PressableProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ViewProps {
    className?: string;
    id?: string;
  }
}
