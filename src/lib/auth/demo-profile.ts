import "server-only";

import { getServerEnv } from "@/lib/env";

export function getDemoProfileId() {
  return getServerEnv().DEMO_PROFILE_ID;
}
