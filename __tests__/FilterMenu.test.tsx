import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActiveFilters from "@/components/users/ActiveFilters";
import FilterMenu from "@/components/users/FilterMenu";
import { DEFAULT_LIST_QUERY, makeSummary, withOptions } from "./fixtures";

const openMenu = () => {
  const onChange = vi.fn();
  render(
    <FilterMenu
      summary={makeSummary()}
      query={DEFAULT_LIST_QUERY}
      onChange={onChange}
      resultCount={2}
    />,
    withOptions,
  );
  fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
  return onChange;
};

describe("FilterMenu", () => {
  it("opens a panel, applies filters live and closes on Escape", () => {
    const onChange = openMenu();
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "US" } });
    expect(onChange).toHaveBeenLastCalledWith({ country: "US" });
    fireEvent.click(screen.getByRole("button", { name: "25–34" }));
    expect(onChange).toHaveBeenLastCalledWith({ age: "25-34" });
    fireEvent.click(screen.getByRole("button", { name: /Coding/ }));
    expect(onChange).toHaveBeenLastCalledWith({ interests: ["Coding"] });

    expect(screen.getByRole("button", { name: "Show 2 users" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Filters" })).not.toBeInTheDocument();
  });

  it("lists the countries present, by name with counts", () => {
    openMenu();
    const select = screen.getByLabelText("Country") as HTMLSelectElement;
    expect(Array.from(select.options, (o) => o.textContent)).toEqual([
      "Any country",
      "United Kingdom (1)",
      "United States (1)",
    ]);
  });

  it("shows how many filters are active on the button", () => {
    render(
      <FilterMenu
        summary={makeSummary()}
        query={{ ...DEFAULT_LIST_QUERY, country: "GB", interests: ["Music"] }}
        onChange={vi.fn()}
        resultCount={1}
      />,
      withOptions,
    );
    expect(screen.getByRole("button", { name: /Filters/ })).toHaveTextContent("2");
  });
});

describe("ActiveFilters", () => {
  it("shows a removable chip per filter and a Clear all", () => {
    const onChange = vi.fn();
    render(
      <ActiveFilters
        query={{
          ...DEFAULT_LIST_QUERY,
          country: "GB",
          age: "18-24",
          interests: ["Music", "Coding"],
        }}
        onChange={onChange}
      />,
      withOptions,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove filter Country: United Kingdom" }));
    expect(onChange).toHaveBeenLastCalledWith({ country: null });
    fireEvent.click(screen.getByRole("button", { name: "Remove filter Music" }));
    expect(onChange).toHaveBeenLastCalledWith({ interests: ["Coding"] });
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onChange).toHaveBeenLastCalledWith({ country: null, age: null, interests: null });
  });

  it("renders nothing with no filters", () => {
    const { container } = render(
      <ActiveFilters query={DEFAULT_LIST_QUERY} onChange={vi.fn()} />,
      withOptions,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
