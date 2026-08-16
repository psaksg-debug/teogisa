import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let cfEnv: Record<string, any> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  cfEnv = require("cloudflare:workers").env || {};
} catch {
  cfEnv = {};
}
const env = new Proxy(cfEnv, {
  get(target, prop: string) {
    return target[prop] ?? process.env[prop];
  }
});

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable."
    );
  }

  return drizzle(env.DB, { schema });
}
