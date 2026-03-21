import type { Context } from "hono";
import { auth } from "@/auth";
import type { AppEnv } from "@/factory";

export async function getSessionHandler(c: Context<AppEnv>) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.session) {
    return c.json({ user: null, session: null }, 200);
  }

  return c.json(session, 200);
}

export async function signOutHandler(c: Context<AppEnv>) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session?.session) {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });
  }

  return c.json({ success: true }, 200);
}
