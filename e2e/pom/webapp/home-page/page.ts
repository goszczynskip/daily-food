import type { Browser, Page } from "@playwright/test";

import { WebappPage } from "../webapp-page";
import { HomePageLocators } from "./locators";

export class HomePage extends WebappPage {
  locators: HomePageLocators;

  public constructor(
    public page: Page,
    public browser: Browser,
  ) {
    super(page, browser);
    this.locators = new HomePageLocators(page);
  }

  public static async create(browser: Browser) {
    const context = await browser.newContext();
    const page = await context.newPage();
    return new HomePage(page, browser);
  }

  gotoHomePage() {
    return this.page.goto(this.webappUrl);
  }
}
