"use client";

import clsx from "clsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  useForm,
  useWatch,
  type DefaultValues,
  type RegisterOptions,
  type SubmitHandler,
} from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@thebensage-dev/ui";
import { COMMON_COUNTRIES, COUNTRIES, countryName } from "@/lib/countries";
import { INTERESTS, MAX_INTERESTS } from "@/lib/userOptions";
import { LIMITS, userSchema, type UserInput } from "@/lib/userSchema";
import type { Access } from "@/lib/access";
import { createUserAction, updateUserAction } from "@/server/userActions";
import type { User } from "@/types";
import SignInRequired from "./SignInRequired";

type UserFormModalProps = {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  /** Visitors can use the form; the server refuses the save. Default: signed in, may edit. */
  access?: Access;
};

const SIGNED_IN: Access = { signedIn: true, canEdit: true, canSignIn: true };

const EMPTY: DefaultValues<UserInput> = {
  fullName: "",
  email: "",
  phone: "",
  // "" shows the "Select country" placeholder; validation rejects it.
  country: "" as UserInput["country"],
  city: "",
  jobTitle: "",
  bio: "",
  interests: [],
};

const fromUser = (user: User): DefaultValues<UserInput> => ({
  fullName: user.fullName,
  email: user.email,
  phone: user.phone ?? "",
  age: user.age,
  country: user.country as UserInput["country"],
  city: user.city ?? "",
  jobTitle: user.jobTitle ?? "",
  bio: user.bio ?? "",
  interests: user.interests as UserInput["interests"],
});

export default function UserFormModal({
  isOpen,
  user,
  onClose,
  access = SIGNED_IN,
}: UserFormModalProps) {
  const isEdit = !!user;
  const uid = useId();
  const titleId = `${uid}-title`;

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [signInRequired, setSignInRequired] = useState(false);
  const selected = useWatch({ control, name: "interests" }) ?? [];
  const bio = useWatch({ control, name: "bio" }) ?? "";

  useEffect(() => {
    if (isOpen) reset(user ? fromUser(user) : EMPTY);
  }, [isOpen, user, reset]);

  const field = (name: keyof UserInput, options?: RegisterOptions<UserInput>) => ({
    id: `${uid}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
    ...register(name, options),
  });

  const labelFor = (name: keyof UserInput, text: string, optional = false) => (
    <label htmlFor={`${uid}-${name}`} className="label">
      {text}
      {optional && <span className="ml-1 font-normal text-foreground-muted">(optional)</span>}
    </label>
  );

  const errorFor = (name: keyof UserInput) =>
    errors[name] ? (
      <p id={`${uid}-${name}-error`} className="field-error">
        {errors[name]?.message}
      </p>
    ) : null;

  const interestOptions = [
    ...INTERESTS,
    ...(user?.interests.filter((i) => !(INTERESTS as readonly string[]).includes(i)) ?? []),
  ];

  const handleClose = () => {
    reset(EMPTY);
    setServerError(null);
    setSignInRequired(false);
    onClose();
  };

  const onSubmit: SubmitHandler<UserInput> = async (data) => {
    setServerError(null);
    setSignInRequired(false);
    const result = user ? await updateUserAction(user.id, data) : await createUserAction(data);
    if (!result.ok) {
      if (result.signInRequired) setSignInRequired(true);
      const fieldErrors = Object.entries(result.fieldErrors ?? {});
      for (const [name, messages] of fieldErrors) {
        if (messages?.[0])
          setError(name as keyof UserInput, { type: "server", message: messages[0] });
      }
      if (fieldErrors.length === 0) setServerError(result.error);
      return;
    }
    reset(EMPTY);
    toast.success(
      user ? `Saved changes to ${result.data.fullName}` : `Added ${result.data.fullName}`,
    );
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose} labelledBy={titleId} size="lg">
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {isEdit ? "Edit user" : "Add new user"}
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              {isEdit
                ? `Update ${user.fullName}'s details.`
                : "Fields marked optional can be filled in later."}
            </p>
            {!access.canEdit && (
              <p className="mt-2 text-sm text-primary-ink">
                Try it out: every field is checked, but saving needs an account.
              </p>
            )}
          </div>
          <button type="button" onClick={handleClose} aria-label="Close" className="icon-btn -m-1">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-5 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {labelFor("fullName", "Full name")}
            <input
              {...field("fullName")}
              autoComplete="off"
              placeholder="e.g. Jane Doe"
              className="input"
            />
            {errorFor("fullName")}
          </div>

          <div>
            {labelFor("email", "Email")}
            <input
              {...field("email")}
              type="email"
              autoComplete="off"
              placeholder="jane@example.com"
              className="input"
            />
            {errorFor("email")}
          </div>

          <div>
            {labelFor("phone", "Phone", true)}
            <input
              {...field("phone")}
              type="tel"
              autoComplete="off"
              placeholder="+44 7700 900123"
              className="input"
            />
            {errorFor("phone")}
          </div>

          <div>
            {labelFor("age", "Age")}
            <input
              {...field("age", {
                setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
              })}
              type="number"
              inputMode="numeric"
              min={18}
              max={120}
              placeholder="18–120"
              className="input"
            />
            {errorFor("age")}
          </div>

          <div>
            {labelFor("country", "Country")}
            <select {...field("country")} className="input">
              <option value="">Select country</option>
              <optgroup label="Common">
                {COMMON_COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {countryName(code)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All countries">
                {COUNTRIES.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </optgroup>
            </select>
            {errorFor("country")}
          </div>

          <div>
            {labelFor("city", "City", true)}
            <input
              {...field("city")}
              autoComplete="off"
              placeholder="e.g. Manchester"
              className="input"
            />
            {errorFor("city")}
          </div>

          <div>
            {labelFor("jobTitle", "Job title", true)}
            <input
              {...field("jobTitle")}
              autoComplete="off"
              placeholder="e.g. Product designer"
              className="input"
            />
            {errorFor("jobTitle")}
          </div>

          <fieldset className="sm:col-span-2" aria-describedby={`${uid}-interests-hint`}>
            <legend className="label flex w-full items-baseline justify-between">
              Interests
              <span
                id={`${uid}-interests-hint`}
                className="text-xs font-normal text-foreground-muted"
              >
                {selected.length} of {MAX_INTERESTS} selected
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <label key={interest}>
                  <input
                    type="checkbox"
                    value={interest}
                    disabled={
                      selected.length >= MAX_INTERESTS && !selected.includes(interest as never)
                    }
                    {...register("interests")}
                    className="peer sr-only"
                  />
                  <span className="toggle-chip cursor-pointer">{interest}</span>
                </label>
              ))}
            </div>
            {errorFor("interests")}
          </fieldset>

          <div className="sm:col-span-2">
            <div className="flex items-baseline justify-between">
              {labelFor("bio", "Bio", true)}
              <span
                className={clsx(
                  "text-xs",
                  bio.length > LIMITS.bio ? "text-danger-ink" : "text-foreground-muted",
                )}
              >
                {bio.length}/{LIMITS.bio}
              </span>
            </div>
            <textarea
              {...field("bio")}
              rows={3}
              placeholder="A sentence or two about them"
              className="input"
            />
            {errorFor("bio")}
          </div>

          {serverError && signInRequired && (
            <SignInRequired message={serverError} access={access} />
          )}
          {serverError && !signInRequired && (
            <p
              role="alert"
              className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-ink sm:col-span-2"
            >
              {serverError}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-surface px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isEdit
              ? isSubmitting
                ? "Saving…"
                : "Save changes"
              : isSubmitting
                ? "Adding…"
                : "Add user"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
