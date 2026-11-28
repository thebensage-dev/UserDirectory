"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { userSchema } from "@/lib/userSchema";
import type { ActionResult, User } from "@/types";
import { accessToken, currentUser } from "./auth";
import { getContent } from "./cms";
import {
  DuplicateEmailError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  createUser,
  deleteUser,
  getUserOptions,
  isId,
  updateUser,
} from "./users";

/** The refusals' wording, from the CMS (User Directory settings, Directory tab). */
async function refusals() {
  return (await getContent()).settings.directory.refusals;
}
type Refusals = Awaited<ReturnType<typeof refusals>>;

const notFound = (text: Refusals): ActionResult<never> => ({ ok: false, error: text.notFound });
const signInRequired = (text: Refusals): ActionResult<never> => ({
  ok: false,
  error: text.signInRequired,
  signInRequired: true,
});
// Signed in (single sign-on from another app, say) without edit access. Same flag, so the forms
// show the "request access" box; it words itself for signed-in people.
const editAccessRequired = (text: Refusals): ActionResult<never> => ({
  ok: false,
  error: text.editAccessRequired,
  signInRequired: true,
});

/** Every page of the site: the directory and profiles are CMS pages at any address, and the
 *  landing page shows the counts. */
function revalidateUsers() {
  revalidatePath("/", "layout");
}

/** The API's refusals, as the results the forms already show. Anything else is a real error. */
function fromApiError(err: unknown, text: Refusals): ActionResult<never> {
  if (err instanceof UnauthorizedError) return signInRequired(text);
  if (err instanceof ForbiddenError) return editAccessRequired(text);
  if (err instanceof DuplicateEmailError) {
    return {
      ok: false,
      error: text.emailTaken,
      fieldErrors: { email: [text.emailTakenField] },
    };
  }
  if (err instanceof ValidationError) {
    return { ok: false, error: text.fixFields, fieldErrors: err.fieldErrors };
  }
  throw err;
}

/**
 * Runs a write with an editor's access token and revalidates the pages, or says why this person
 * can't write. The API checks the token and the groups again.
 */
async function asEditor<T>(
  text: Refusals,
  write: (token: string) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const user = await currentUser();
  if (!user) return signInRequired(text);
  if (!user.canEdit) return editAccessRequired(text);
  const token = await accessToken();
  if (!token) return signInRequired(text);
  try {
    return await write(token);
  } catch (err) {
    return fromApiError(err, text);
  }
}

// Signed-out visitors may try the forms: their input is validated exactly like a signed-in
// user's, and only the write itself is refused, so the demo shows every check. The API
// validates again with the same rules.
async function save(id: number | null, input: unknown): Promise<ActionResult<User>> {
  const [options, text] = await Promise.all([getUserOptions(), refusals()]);
  const parsed = userSchema(options).safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: text.fixFields,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  return asEditor(text, async (token) => {
    const user =
      id === null ? await createUser(parsed.data, token) : await updateUser(id, parsed.data, token);
    if (!user) return notFound(text);
    revalidateUsers();
    return { ok: true, data: user };
  });
}

export async function createUserAction(input: unknown): Promise<ActionResult<User>> {
  return save(null, input);
}

export async function updateUserAction(id: number, input: unknown): Promise<ActionResult<User>> {
  if (!isId(id)) return notFound(await refusals());
  return save(id, input);
}

export async function deleteUserAction(id: number): Promise<ActionResult<null>> {
  const text = await refusals();
  if (!isId(id)) return notFound(text);
  return asEditor(text, async (token) => {
    await deleteUser(id, token);
    revalidateUsers();
    return { ok: true, data: null };
  });
}
