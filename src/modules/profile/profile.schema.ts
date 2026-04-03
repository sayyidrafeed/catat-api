import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "@/db/schema";

export const selectProfileSchema = createSelectSchema(user).omit({
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().nullable().optional(),
});

export type ProfileResponse = z.infer<typeof selectProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
