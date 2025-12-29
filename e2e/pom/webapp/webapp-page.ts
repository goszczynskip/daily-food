/** turbo gen: imports */
import type { Browser, Page } from "@playwright/test";

import type { UserAttributes } from "../../helpers/supabase";
import { createSupabaseClient } from "../../helpers/supabase";
import { WebAppLocators } from "./webapp-locators";

export class WebappPage {
  public webappUrl = "http://localhost:3000";
  public userId: string | undefined;

  locators: WebAppLocators;

  public constructor(
    public page: Page,
    public browser: Browser,
  ) {
    this.locators = new WebAppLocators(page);
  }

  protected static async create(browser: Browser) {
    const context = await browser.newContext();
    const page = await context.newPage();
    return new WebappPage(page, browser);
  }

  /** turbo gen: methods */
  isLoggedIn(user?: UserAttributes) {
    return this.locators.userAvatar(user?.email?.charAt(0) ?? "").isVisible();
  }

  async login({
    email,
    password,
    id,
  }: {
    email: string;
    password: string;
    id?: string;
  }) {
    const { client: supabaseClient, cookies } = createSupabaseClient();

    const result = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (result.error) {
      throw new Error(`Failed to sign in ${result.error.message}`);
    }

    const webAppUrl = new URL(this.webappUrl);
    const cookiesToAdd = cookies.getAll().map((requestCookie) => {
      const { value, name, path, ...cookie } =
        requestCookie as typeof requestCookie & { path?: string };
      return {
        ...cookie,
        name,
        /**
         * We need to encode cookie in the same way nextjs does
         * @see https://github.com/vercel/next.js/blob/b548fc74b77d4e6cbac2cbf3d9c4593bd9732560/packages/next/src/compiled/%40edge-runtime/cookies/index.js#L45
         */
        value: encodeURIComponent(value),
        url: path ? new URL(path, webAppUrl).href : webAppUrl.href,
      };
    });

    await this.page.context().clearCookies();
    await this.page.context().addCookies(cookiesToAdd);

    await this.page.reload();

    this.userId = id;
  }

  is404Page() {
    return this.page
      .getByText(/404: This page could not be found./)
      .isVisible();
  }
}
