import type { Context } from "hono";
import * as HttpStatus from "stoker/http-status-codes";

import type { AppEnv } from "@/factory";
import { NotFoundError } from "@/lib/errors";

import * as service from "./profile.service";
import { updateProfileSchema } from "./profile.schema";

export const getProfileHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const result = await service.getProfile(user!.id);

  if (!result) {
    throw new NotFoundError("Profile not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const updateProfileHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const json = await c.req.json();
  const data = updateProfileSchema.parse(json);
  const result = await service.updateProfile(user!.id, data);

  if (!result) {
    throw new NotFoundError("Profile not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const deleteAccountHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const result = await service.deleteAccount(user!.id);

  if (!result) {
    throw new NotFoundError("Profile not found");
  }

  return c.body(null, HttpStatus.NO_CONTENT);
};
