import type { ZodError } from "zod";
import React, { useEffect } from "react";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useAuthStore } from "@tonik/auth-native";

import type { SupportedLanguage } from "./resources";
import { useTrpc } from "../trpc/react";
import { supportedLanguagesSchema } from "./resources";
import i18n from "./setup";

interface Locale {
  language: SupportedLanguage | null;
  languageOrigin?: "system" | "user";
  currencyCode: string | null;
  currencyCodeOrigin?: "system" | "user";
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
  locale: Locale;
}

interface LocaleLoadedState {
  state: "hydrated";
  locale: Locale;
  error?: ZodError | Error | string | null;
}

interface LocaleActions {
  preinitialize: (locale: RawLocale, currentState: LocaleState) => void;
  initialize: (locale?: RawLocale) => Promise<void>;
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
    (set, get) => ({
      state: "init",
      locale: null,
      preinitialize: (locale: RawLocale, currentState) => {
        const language = supportedLanguagesSchema.parse(locale.language);

        const stateLocale = currentState.locale;

        set({
          state: "local",
          locale: {
            language:
              stateLocale?.languageOrigin === "user"
                ? stateLocale.language
                : language,
            currencyCode:
              stateLocale?.currencyCodeOrigin === "user"
                ? stateLocale.currencyCode
                : (locale.currencyCode ?? "USD"),
            languageOrigin: stateLocale?.languageOrigin ?? "system",
            currencyCodeOrigin: stateLocale?.currencyCodeOrigin ?? "system",
          },
        });
      },
      initialize: async (serverSavedLocale?: RawLocale) => {
        if (!serverSavedLocale) {
          set({ state: "hydrated" });
          return;
        }

        const language = supportedLanguagesSchema.parse(
          serverSavedLocale.language,
        );

        await i18n.changeLanguage(language);

        set({
          state: "hydrated",
          locale: {
            language,
            languageOrigin: serverSavedLocale.language ? "user" : "system",
            currencyCode: serverSavedLocale.currencyCode ?? "USD",
            currencyCodeOrigin: serverSavedLocale.currencyCode
              ? "user"
              : "system",
          },
        });
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
        const locales = getLocales();
        const defaultLocale = locales[0];

        state.preinitialize(
          {
            currencyCode: defaultLocale?.currencyCode,
            language: defaultLocale?.languageCode,
          },
          state,
        );
      },
    },
  ),
);

export const I18NProvider = ({ children }: { children: React.ReactNode }) => {
  const trpc = useTrpc();
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

    void locale.initialize();
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
      auth.session &&
      auth.session.user.user_metadata.language !== locale.locale.language
    ) {
      mutate({ language: locale.locale.language });
    }
  }, [
    auth.session,
    auth.session?.user.user_metadata.language,
    locale.locale?.language,
    mutate,
  ]);

  return <>{children}</>;
};
