import { createContext, useContext, useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";

interface ClipboardContextValue {
  clipboardContent: string;
  isValidOtp: boolean;
}

const ClipboardContext = createContext<ClipboardContextValue | null>(null);

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clipboardContent, setClipboardContent] = useState("");

  useEffect(() => {
    const subscription = Clipboard.addClipboardListener((event) => {
      setClipboardContent(event.content || "");
    });

    // Get initial clipboard content
    Clipboard.getStringAsync().then(setClipboardContent);

    return () => {
      Clipboard.removeClipboardListener(subscription);
    };
  }, []);

  const isValidOtp = /^\d{6}$/.test(clipboardContent);

  return (
    <ClipboardContext.Provider value={{ clipboardContent, isValidOtp }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboardContext = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error(
      "useClipboardContext must be used within ClipboardProvider",
    );
  }
  return context;
};
