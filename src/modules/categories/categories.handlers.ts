import type { Context } from "hono";
import * as HttpStatus from "stoker/http-status-codes";

import { db } from "@/db";
import type { AppEnv } from "@/factory";
import { NotFoundError } from "@/lib/errors";

import * as service from "./categories.service";

export const createCategoryHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const data = c.req.valid("json" as never);
  const result = await service.createCategory(data, user!.id, db);
  return c.json(result, HttpStatus.CREATED);
};

export const getCategoriesHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const result = await service.getCategories(user!.id, db);
  return c.json(result, HttpStatus.OK);
};

export const getCategoryHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = c.req.valid("param" as never);
  const result = await service.getCategoryById(id, user!.id, db);

  if (!result) {
    throw new NotFoundError("Category not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const updateCategoryHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = c.req.valid("param" as never);
  const data = c.req.valid("json" as never);
  const result = await service.updateCategory(id, user!.id, data, db);

  if (!result) {
    throw new NotFoundError("Category not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const deleteCategoryHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = c.req.valid("param" as never);
  const result = await service.deleteCategory(id, user!.id, db);

  if (!result) {
    throw new NotFoundError("Category not found");
  }

  return c.body(null, HttpStatus.NO_CONTENT);
};
