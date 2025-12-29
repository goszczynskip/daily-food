"use client";

import { useOptimistic } from "react";
import { useRouter } from "next/navigation";

import type { User } from "@tonik/supabase";
import { BasicPageAuth } from "@tonik/ui/recipes/basic-page";

import { api } from "~/trpc/react";

interface NavAuth {
  user: User | null;
}

const NavAuthClient = ({ user: extUser }: NavAuth) => {
  const [user, setOptimisticUser] = useOptimistic(extUser);
  const router = useRouter();

  const { mutate } = api.auth.logout.useMutation({
    onSettled: () => {
      router.refresh();
    },
  });

  return (
    <BasicPageAuth
      user={user}
      onSignIn={() => {
        router.push("/login");
      }}
      onSignUp={() => {
        router.push("/signup");
      }}
      onSignOut={() => {
        setOptimisticUser(null);
        mutate();
      }}
    />
  );
};

export { NavAuthClient };
