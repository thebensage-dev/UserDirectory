import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserFormModal from "@/components/users/UserFormModal";
import { createUserAction, updateUserAction } from "@/server/userActions";
import type { User } from "@/types";
import { makeUser } from "./fixtures";

vi.mock("@/server/userActions", () => ({ createUserAction: vi.fn(), updateUserAction: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/users" }));
const createMock = vi.mocked(createUserAction);
const updateMock = vi.mocked(updateUserAction);

function renderModal(user?: User) {
  const onClose = vi.fn();
  render(<UserFormModal isOpen user={user} onClose={onClose} />);
  return { onClose };
}

const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

function fillValidForm() {
  type("Full name", "John Doe");
  type("Email", "john@example.com");
  type("Age", "30");
  type("Country", "GB");
  fireEvent.click(screen.getByLabelText("Sports"));
}

const submit = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

describe("UserFormModal", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("adding a user", () => {
    it("renders an empty form with optional fields marked", () => {
      renderModal();

      expect(screen.getByText("Add new user")).toBeInTheDocument();
      expect(screen.getByLabelText("Full name")).toHaveValue("");
      expect(screen.getByLabelText("Country")).toHaveValue("");
      expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
      expect(screen.getByText("0 of 5 selected")).toBeInTheDocument();
    });

    it("closes from the close button and from Cancel", () => {
      const { onClose } = renderModal();

      submit("Close");
      submit("Cancel");
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it("calls the create action with the form values, then closes", async () => {
      createMock.mockResolvedValue({ ok: true, data: makeUser({ fullName: "John Doe" }) });
      const { onClose } = renderModal();

      fillValidForm();
      submit("Add user");

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: "John Doe", email: "john@example.com", age: 30 }),
      );
    });

    it("shows server field errors next to the field (e.g. duplicate email)", async () => {
      createMock.mockResolvedValue({
        ok: false,
        error: "That email is already in use.",
        fieldErrors: { email: ["Another user already has this email"] },
      });
      const { onClose } = renderModal();

      fillValidForm();
      submit("Add user");

      expect(await screen.findByText("Another user already has this email")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
      expect(onClose).not.toHaveBeenCalled();
    });

    it("shows a general error when the action fails without field errors", async () => {
      createMock.mockResolvedValue({ ok: false, error: "That user no longer exists." });
      renderModal();

      fillValidForm();
      submit("Add user");

      expect(await screen.findByRole("alert")).toHaveTextContent("That user no longer exists.");
    });

    it("shows validation errors when required fields are empty", async () => {
      renderModal();
      submit("Add user");

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Age is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Choose a country/i)).toBeInTheDocument();
        expect(screen.getByText(/Pick at least one interest/i)).toBeInTheDocument();
      });
    });

    it("validates a field as soon as you leave it", async () => {
      renderModal();
      const email = screen.getByLabelText("Email");

      fireEvent.change(email, { target: { value: "nope" } });
      fireEvent.blur(email);

      expect(await screen.findByText(/Enter a valid email/)).toBeInTheDocument();
    });

    it("stops you picking more than 5 interests", () => {
      renderModal();
      for (const i of ["Art", "Books", "Coding", "Cooking", "Fashion"])
        fireEvent.click(screen.getByLabelText(i));

      expect(screen.getByText("5 of 5 selected")).toBeInTheDocument();
      expect(screen.getByLabelText("Music")).toBeDisabled();
      expect(screen.getByLabelText("Art")).toBeEnabled();
    });
  });

  describe("editing a user", () => {
    const existing = makeUser({
      id: 7,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      age: 36,
      country: "GB",
      city: "London",
      jobTitle: "Mathematician",
      interests: ["Coding", "Music"],
    });

    it("pre-fills the form with the user's details", async () => {
      renderModal(existing);

      expect(screen.getByText("Edit user")).toBeInTheDocument();
      await waitFor(() => expect(screen.getByLabelText("Full name")).toHaveValue("Ada Lovelace"));
      expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
      expect(screen.getByLabelText("Age")).toHaveValue(36);
      expect(screen.getByLabelText("Country")).toHaveValue("GB");
      expect(screen.getByLabelText(/City/)).toHaveValue("London");
      expect(screen.getByLabelText(/Job title/)).toHaveValue("Mathematician");
      expect(screen.getByLabelText("Coding")).toBeChecked();
      expect(screen.getByLabelText("Sports")).not.toBeChecked();
    });

    it("calls the update action with the changes", async () => {
      updateMock.mockResolvedValue({ ok: true, data: { ...existing, age: 37 } });
      const { onClose } = renderModal(existing);

      await waitFor(() => expect(screen.getByLabelText("Full name")).toHaveValue("Ada Lovelace"));
      type("Age", "37");
      submit("Save changes");

      await waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(updateMock).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ age: 37, city: "London", interests: ["Coding", "Music"] }),
      );
    });
  });

  describe("as a signed-out visitor", () => {
    it("runs the checks, then shows the refusal with ways to get access", async () => {
      createMock.mockResolvedValue({
        ok: false,
        error: "Please sign in to make changes.",
        signInRequired: true,
      });
      const onClose = vi.fn();
      render(
        <UserFormModal
          isOpen
          onClose={onClose}
          access={{ signedIn: false, canEdit: false, canSignIn: true }}
        />,
      );

      expect(screen.getByText(/saving needs an account/)).toBeInTheDocument();
      submit("Add user");
      expect(await screen.findByText(/Name is required/)).toBeInTheDocument();
      expect(createMock).not.toHaveBeenCalled();

      fillValidForm();
      submit("Add user");
      expect(await screen.findByText("Please sign in to make changes.")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Email me for access/ })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Sign in/ })).toHaveAttribute(
        "href",
        "/auth/login?returnTo=%2Fusers",
      );
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
