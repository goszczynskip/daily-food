import "server-only";

import { api } from "~/trpc/rsc";
import { NavAuthClient } from "./nav-auth.client";

async function NavAuth() {
  const user = await api.auth.me();
  return <NavAuthClient user={user} />;
}

export { NavAuth };
