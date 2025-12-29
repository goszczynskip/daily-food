/** turbo gen: imports */

import type { Page } from "@playwright/test";

class WebAppLocators {
  public constructor(public page: Page) {}

  /** turbo gen: methods */
  userAvatar(name: string) {
    return this.page
      .getByRole("banner")
      .getByRole("button", { name, exact: true });
  }
}

export { WebAppLocators };
