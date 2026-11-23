"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { userSchema } from "@/lib/userSchema";
import type { ActionResult, User } from "@/types";
import { accessToken, currentUser } from "./auth";
import {
  DuplicateEmailError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  createUser,
  deleteUser,
  updateUser,
} from "./users";

const NOT_FOUND: ActionResult<never> = { ok: false, error: "That user no longer exists." };
const SIGN_IN_REQUIRED: ActionResult<never> = {
  ok: false,
  error: "Please sign in to make changes.",
  signInRequired: true,
};
// Signed in (single sign-on from another app, say) without edit access. Same flag, so the forms
// show the "request access" box; it words itself for signed-in people.
const EDIT_ACCESS_REQUIRED: ActionResult<never> = {
  ok: false,
  error: "Your account can't make changes yet.",
  signInRequired: true,
};
const FIX_FIELDS = "Please fix the highlighted fields.";

// Server Actions are public POST endpoints, so arguments can be anything at runtime.
const isId = (id: unknown): id is number => Number.isInteger(id) && (id as number) > 0;

function revalidateUsers(id?: number) {
  revalidatePath("/");
  revalidatePath("/users");
  if (id) revalidatePath(`/users/${id}`);
}

/** The API's refusals, as the results the forms already show. Anything else is a real error. */
function fromApiError(err: unknown): ActionResult<never> {
  if (err instanceof UnauthorizedError) return SIGN_IN_REQUIRED;
  if (err instanceof ForbiddenError) return EDIT_ACCESS_REQUIRED;
  if (err instanceof DuplicateEmailError) {
    return {
      ok: false,
      error: "That email is already in use.",
      fieldErrors: { email: ["Another user already has this email"] },
    };
  }
  if (err instanceof ValidationError) {
    return { ok: false, error: FIX_FIELDS, fieldErrors: err.fieldErrors };
  }
  throw err;
}

/** Why this person can't write, or null when they can. (The API checks again.) */
async function refusal(): Promise<ActionResult<never> | null> {
  const user = await currentUser();
  if (!user) return SIGN_IN_REQUIRED;
  return user.canEdit ? null : EDIT_ACCESS_REQUIRED;
}

// Signed-out visitors may try the forms: their input is validated exactly like a signed-in
// user's, and only the write itself is refused, so the demo shows every check. The API
// validates again with the same rules.
async function save(id: number | null, input: unknown): Promise<ActionResult<User>> {
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: FIX_FIELDS, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const refused = await refusal();
  if (refused) return refused;
  const token = await accessToken();
  if (!token) return SIGN_IN_REQUIRED;

  try {
    const user =
      id === null ? await createUser(parsed.data, token) : await updateUser(id, parsed.data, token);
    if (!user) return NOT_FOUND;
    revalidateUsers(user.id);
    return { ok: true, data: user };
  } catch (err) {
    return fromApiError(err);
  }
}

export async function createUserAction(input: unknown) {
  return save(null, input);
}

export async function updateUserAction(id: number, input: unknown): Promise<ActionResult<User>> {
  if (!isId(id)) return NOT_FOUND;
  return save(id, input);
}

export async function deleteUserAction(id: number): Promise<ActionResult<null>> {
  if (!isId(id)) return NOT_FOUND;
  const refused = await refusal();
  if (refused) return refused;
  const token = await accessToken();
  if (!token) return SIGN_IN_REQUIRED;
  try {
    await deleteUser(id, token);
  } catch (err) {
    return fromApiError(err);
  }
  revalidateUsers(id);
  return { ok: true, data: null };
}
