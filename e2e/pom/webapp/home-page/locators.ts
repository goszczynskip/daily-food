import type { Page } from "@playwright/test";

import { WebAppLocators } from "../webapp-locators";

class HomePageLocators extends WebAppLocators {
  public constructor(public page: Page) {
    super(page);
  }

  heroTitle() {
    return this.page.locator("h1");
  }
}

export { HomePageLocators };
