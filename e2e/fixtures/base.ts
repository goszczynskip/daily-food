import type { Browser } from "@playwright/test";
import { test as base } from "@playwright/test";

import type { SupabaseClient } from "../helpers/supabase";
import { createSupabaseClient } from "../helpers/supabase";
import { HomePage } from "../pom/webapp/home-page/page";

interface WebappFixture {
  webapp: HomePage;
}

export const testWebapp = base.extend<WebappFixture>({
  webapp: async (
    { browser }: { browser: Browser },
    use: (x: HomePage) => Promise<void>,
  ) => {
    const webapp = await HomePage.create(browser);

    await webapp.gotoHomePage();

    await use(webapp);
  },
});

interface InternalSupabaseFixture {
  supabase: SupabaseClient;
}

const internalSupabaseFixture = base.extend<InternalSupabaseFixture>({
  supabase: async ({ page: _ }, use) => {
    const { client: supabase } = createSupabaseClient();
    await use(supabase);
  },
});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SupabaseFixture {}

/**
 * Placeholder for supabase fixture
 * You can extend it with your own supabase fixtures to setup test data
 * Remember to cleanup after tests
 *
 * @example
 * ```ts
 * export const supabaseFixture = internalSupabaseFixture.extend<SupabaseFixture>({
 *   createPost: async ({ supabase }, use) => {
 *     const createdIds: { info: TestInfo; id: number }[] = [];
 *     const createPostFn = async (data: PostData, now?: number) => {
 *       const info = supabaseFixture.info();
 *
 *       // Some create a post helper function
 *       const createdPost = await createPost(
 *         supabase,
 *         mergeDeep(
 *           // faker data generator with optional overrides
 *           getDefaultPostData(now ?? Date.now(), info.workerIndex.toString()),
 *           data,
 *         ),
 *       );
 *
 *       createdIds.push({ info, id: createdPost.post.id });
 *
 *       return createdPost;
 *     };
 *
 *     await use(createPostFn);
 *
 *     const { error } = await supabase
 *       .from("posts")
 *       .delete()
 *       .in(
 *         "id",
 *         createdIds.map(({ id }) => id),
 *       );
 *
 *     if (error) {
 *       throw error;
 *     }
 *   },
 * });
 *```
 **/
export const supabaseFixture = internalSupabaseFixture.extend<SupabaseFixture>(
  {},
);
