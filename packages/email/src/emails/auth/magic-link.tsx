import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import type { MagicLinkEmailProps } from "../../types";
import { t, USER_LANG } from "../../components/lang";
import { Logo } from "../../components/logo";
import { withDebugLang } from "../../components/with-debug-lang";

export const MagicLinkEmailBase = ({
  token = "{{ .Token }}",
  siteUrl = "{{ .SiteURL }}",
  lang = USER_LANG,
}: MagicLinkEmailProps) => {
  return (
    <Html lang={lang}>
      <Head />
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>
            {t({
              en: "Your Daily Food login code",
              pl: "Twój kod do Daily Food",
            })}
          </Preview>
          <Container className="mx-auto my-10 max-w-lg">
            <Logo className="mx-auto mb-10" siteUrl={siteUrl} />

            <Text className="mb-8 text-center text-xl font-semibold">
              {t({
                en: "Sign in to Daily Food",
                pl: "Dokończ logowanie",
              })}
            </Text>

            <Text className="mb-8 text-center">
              {t({
                en: "Enter this code on the sign-in screen to access your account.",
                pl: "Wpisz jenorazowy kod weryfikacyjny w aplikacji Daily Food.",
              })}
            </Text>

            <Container className="mb-8">
              <Section className="rounded-lg bg-[rgba(0,0,0,0.1)] text-center">
                <Text className="text-3xl font-semibold tracking-wider">
                  {token}
                </Text>
              </Section>

              <Text className="text-center font-semibold mb-0">
                {t({
                  en: "This code will expire in 1 hour.",
                  pl: "Ten kod wygaśnie za 1 godzinę.",
                })}
              </Text>
            </Container>

            <Text className="text-center">
              {t({
                en: "If you didn't request this code, you can safely ignore this email.",
                pl: "To nie ty się logujesz? Możesz bezpiecznie zignorować tę wiadomość.",
              })}
            </Text>

            <Section className="text-center">
              <Text>
                {t({
                  en: "Happy planning!",
                  pl: "Udanego planowania!",
                })}
                <br />
                Daily Food
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

MagicLinkEmailBase.PreviewProps = {
  token: "123456",
  _email: "user@example.com",
  siteUrl: "http://localhost:3000",
  lang: "en",
  debugLang: "pl",
} as MagicLinkEmailProps;

export const MagicLinkEmail = withDebugLang(MagicLinkEmailBase);

export default MagicLinkEmail;
