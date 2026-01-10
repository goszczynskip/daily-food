import React, { useEffect } from "react";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { ZodError } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useAuthStore } from "@tonik/auth-native";

import { trpc } from "../trpc/react";
import { SupportedLanguage, supportedLanguagesSchema } from "./resources";
import { i18n } from "./setup";

interface Locale {
  language: SupportedLanguage | null;
  currencyCode: string | null;
}

interface RawLocale {
  language?: string | null;
  currencyCode?: string | null;
}

interface LocaleInitialState {
  state: "init";
  locale: null;
}

interface LocaleLoadingState {
  state: "local";
  locale: null;
}

interface LocaleLoadedState {
  state: "hydrated";
  locale: Locale;
  error?: ZodError | Error | string | null;
}

interface LocaleActions {
  preinitialize: () => void;
  initialize: (locale?: RawLocale) => void;
}

type LocaleState = LocaleInitialState | LocaleLoadingState | LocaleLoadedState;
type LocaleStore = LocaleState & LocaleActions;

const storage = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
};

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      state: "init",
      locale: null,
      preinitialize: () => {
        set({ state: "local" });
      },
      initialize: async (locale?: RawLocale) => {
        if (!locale) {
          set({ state: "hydrated" });
          return;
        }

        const supportedLanguageResult = supportedLanguagesSchema.safeParse(
          locale.language,
        );

        if (supportedLanguageResult.success) {
          await i18n.changeLanguage(supportedLanguageResult.data);

          set({
            state: "hydrated",
            locale: {
              language: supportedLanguageResult.data ?? null,
              currencyCode: locale.currencyCode ?? null,
            },
          });
        } else {
          set({
            state: "hydrated",
            locale: {
              language: null,
              currencyCode: null,
            },
          });
        }
      },
    }),
    {
      name: "locale-storage",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getItem(key),
        setItem: (key, value) => storage.setItem(key, value),
        removeItem: (key) => storage.removeItem(key),
      })),
      onRehydrateStorage(state) {
        state.preinitialize();
      },
    },
  ),
);

export const I18NProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthStore();
  const locale = useLocaleStore();
  const { mutate } = useMutation(
    trpc.user.changeLanguage.mutationOptions({
      async onMutate(variables, context) {
        await i18n.changeLanguage(variables.language);
      },
      onError: () => {},
      onSuccess: (data) => {},
    }),
  );

  useEffect(() => {
    if (auth.state === "loading") return;
    if (locale.state !== "local") return;

    if (auth.state === "authenticated") {
      void locale.initialize({
        language: auth.session.user.user_metadata.language,
        currencyCode: auth.session.user.user_metadata.currency_code,
      });
      return;
    }

    const locales = getLocales();
    const defaultLocale = locales[0];
    void locale.initialize({
      currencyCode: defaultLocale.currencyCode,
      language: defaultLocale.languageCode,
    });
  }, [
    auth.session?.user.user_metadata.currency_code,
    auth.session?.user.user_metadata.language,
    auth.state,
    locale,
    locale.state,
  ]);

  useEffect(() => {
    if (
      locale.locale?.language &&
      auth.session?.user.user_metadata.language !== locale.locale.language
    ) {
      mutate({ language: locale.locale.language });
    }
  }, [
    auth.session?.user.user_metadata.language,
    locale.locale?.language,
    mutate,
  ]);

  return <>{children}</>;
};
