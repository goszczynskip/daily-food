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

import type { SignupEmailProps } from "../../types";
import { tr } from "../../components/lang";
import { Logo } from "../../components/logo";

export const SignupEmail = ({
  token = "{{ .Token }}",
  siteUrl = "{{ .SiteURL }}",
  email = "{{ .Email }}",
  lang,
}: SignupEmailProps) => {
  // Use runtime translation (tr) when lang is a real language code,
  // otherwise use static translation (t) for Go template generation
  const t = tr(lang);

  return (
    <Html lang={lang}>
      <Head />
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>
            {t({
              en: "Confirm your Daily Food account",
              pl: "Potwierdź swoje konto w Daily Food",
            })}
          </Preview>
          <Container className="mx-auto my-10 max-w-lg">
            <Logo className="mx-auto mb-10" siteUrl={siteUrl} />

            <Text className="mb-8 text-center text-xl font-semibold">
              {t({
                en: "Welcome to Daily Food!",
                pl: "Witamy w Daily Food!",
              })}
            </Text>

            <Text className="mb-8 text-center">
              {t({
                en: `Thanks for signing up with ${email}. Enter this confirmation code to activate your account.`,
                pl: `Dziękujemy za rejestrację z ${email}. Wpisz ten kod, aby aktywować swoje konto.`,
              })}
            </Text>

            <Container className="mb-8">
              <Section className="rounded-lg bg-[rgba(0,0,0,0.1)] text-center">
                <Text className="text-3xl font-semibold tracking-wider">
                  {token}
                </Text>
              </Section>

              <Text className="mb-0 text-center font-semibold">
                {t({
                  en: "This code will expire in 1 hour.",
                  pl: "Ten kod wygaśnie za 1 godzinę.",
                })}
              </Text>
            </Container>

            <Text className="text-center">
              {t({
                en: "If you didn't create an account with Daily Food, you can safely ignore this email.",
                pl: "To nie ty zakładałeś konta? Możesz bezpiecznie zignorować tę wiadomość.",
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

SignupEmail.PreviewProps = {
  token: "123456",
  email: "user@example.com",
  siteUrl: "http://localhost:3000",
  lang: "en",
} as SignupEmailProps;

export default SignupEmail;
