import type { LoginRequest } from "./types";
import { useAuthStore } from "./provider";

export const useLoginHandle = (mutate: (request: LoginRequest) => void) => {
  const authStore = useAuthStore();

  return async (request: LoginRequest) => {
    switch (request.type) {
      case "social": {
        switch (request.provider) {
          case "google":
            break;

          case "apple":
            break;
        }
        break;
      }
      default: {
        mutate(request);
      }
    }
  };
};

const appleSignIn = async () => {};
