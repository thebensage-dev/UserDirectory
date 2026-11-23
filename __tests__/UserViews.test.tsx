import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Highlight } from "@thebensage-dev/ui";
import UserCards from "@/components/users/UserCards";
import UserTable from "@/components/users/UserTable";
import { makeUser } from "./fixtures";

const alice = makeUser({
  id: 1,
  fullName: "Alice Smith",
  age: 28,
  country: "GB",
  city: "Leeds",
  jobTitle: "Designer",
});
const bob = makeUser({
  id: 2,
  fullName: "Bob Johnson",
  age: 35,
  country: "US",
  interests: ["Reading"],
});
const users = [alice, bob];

describe("UserCards", () => {
  it("shows job title, location with full country name, and interests", () => {
    render(<UserCards users={users} />);

    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getByText("Leeds, United Kingdom")).toBeInTheDocument();
    expect(screen.getByText("35 years old")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();

    const [aliceInterests] = screen.getAllByRole("list", { name: "Interests" });
    expect(
      within(aliceInterests)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Sports", "Music"]);
  });

  it("links each card to the profile", () => {
    render(<UserCards users={users} />);
    expect(screen.getByRole("link", { name: /Alice Smith/ })).toHaveAttribute("href", "/users/1");
    expect(screen.getByRole("link", { name: /Bob Johnson/ })).toHaveAttribute("href", "/users/2");
  });

  it("calls onEdit / onDelete with the right user, and hides them without handlers", async () => {
    const { rerender } = render(<UserCards users={users} />);
    expect(screen.queryByRole("button", { name: /Edit|Delete/ })).not.toBeInTheDocument();

    const onEdit = vi.fn();
    const onDelete = vi.fn();
    rerender(<UserCards users={users} onEdit={onEdit} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Bob Johnson" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Alice Smith" }));

    expect(onEdit).toHaveBeenCalledWith(bob);
    expect(onDelete).toHaveBeenCalledWith(alice);
  });
});

describe("UserTable", () => {
  it("renders a row per user with country name and code", () => {
    render(<UserTable users={users} />);

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByRole("link", { name: /Alice Smith/ })).toHaveAttribute(
      "href",
      "/users/1",
    );
    expect(within(rows[2]).getByText("35")).toBeInTheDocument();
    expect(within(rows[2]).getByText("United States")).toBeInTheDocument();
    expect(within(rows[2]).getByText("US")).toBeInTheDocument();
  });

  it("sorts from the column headers and marks the active column", async () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <UserTable users={users} sort="id-desc" onSortChange={onSortChange} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Age" }));
    expect(onSortChange).toHaveBeenLastCalledWith("age-asc");

    rerender(<UserTable users={users} sort="age-asc" onSortChange={onSortChange} />);
    expect(screen.getByRole("columnheader", { name: "Age" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await userEvent.click(screen.getByRole("button", { name: "Age" }));
    expect(onSortChange).toHaveBeenLastCalledWith("age-desc");
  });
});

describe("Highlight", () => {
  it("marks matches ignoring case and accents, keeping the original text", () => {
    const { container } = render(<Highlight text="Sofia Martínez" terms={["martinez"]} />);
    expect(container).toHaveTextContent("Sofia Martínez");
    expect(container.querySelector("mark")).toHaveTextContent("Martínez");
  });

  it("renders plain text with no terms", () => {
    const { container } = render(<Highlight text="Plain" terms={[]} />);
    expect(container.querySelector("mark")).toBeNull();
  });
});
