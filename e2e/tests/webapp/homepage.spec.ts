/** turbo gen: imports */
import { expect } from "@playwright/test";

import { testWebapp } from "../../fixtures/base";
import { testLoggedInWebapp } from "../../fixtures/logged-in";

testWebapp.describe("As Anonymous", () => {
  testWebapp.describe("Homepage", () => {
    testWebapp("Has correct hero title", async ({ webapp }) => {
      await webapp.gotoHomePage();
      await expect(webapp.locators.heroTitle()).toBeVisible();
      await expect(webapp.locators.heroTitle()).toHaveText("Boring Stack");
    });
  });
});

testLoggedInWebapp.describe("As User", () => {
  testLoggedInWebapp.describe("Homepage", () => {
    testLoggedInWebapp(
      "Shows logged in user",
      async ({ loggedInWebapp, user }) => {
        expect(await loggedInWebapp.isLoggedIn(user)).toBe(true);
      },
    );
  });
});
