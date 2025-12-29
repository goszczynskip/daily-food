/** turbo gen: imports */
import { expect } from "@playwright/test";

import { testWebapp } from "../../fixtures/base";

testWebapp.describe("As Anonymous", () => {
  testWebapp.describe("Homepage", () => {
    testWebapp("Has correct hero title", async ({ webapp }) => {
      await webapp.gotoHomePage();
      await expect(webapp.locators.heroTitle()).toBeVisible();
      await expect(webapp.locators.heroTitle()).toHaveText("Boring Stack");
    });
  });
});
