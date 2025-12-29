import type { Browser } from "@playwright/test";
import { test as base } from "@playwright/test";

import type { UserAttributes } from "../helpers/supabase";
import { env } from "../env";
import { createUser } from "../helpers/supabase";
import { HomePage } from "../pom/webapp/home-page/page";

export const loggedInCreator = async (
  { browser, user }: { browser: Browser; user?: UserAttributes },
  use: (x: HomePage) => Promise<void>,
) => {
  const credentials = await createUser({ user, skipIfUserExists: true });

  const webapp = await HomePage.create(browser);

  await webapp.login(credentials);
  await webapp.gotoHomePage();
  await use(webapp);
};

interface WebappLoggedInFixture {
  user?: UserAttributes;
  loggedInWebapp: HomePage;
}

/**
 * Setups a test with a default logged in user.
 * If you want to pass custom user options use webappLoggedInCreator directly and construct your own fixture.
 *
 * If that's not enough you can always use createUser helper and use login logic from HomePage.
 **/
export const testLoggedInWebapp = base.extend<WebappLoggedInFixture>({
  user: [
    {
      email: env.TEST_USER_EMAIL,
      password: env.TEST_USER_PASSWORD,
    },
    { option: true },
  ],
  loggedInWebapp: loggedInCreator,
});
