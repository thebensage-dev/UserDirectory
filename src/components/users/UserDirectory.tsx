"use client";

import clsx from "clsx";
import { Plus, SearchX, Users } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useCallback, useRef, useState, useTransition } from "react";
import { EmptyState, Pagination, useShortcut } from "@thebensage-dev/ui";
import { NO_FILTERS, PAGE_SIZES, listQueryParsers } from "@/lib/listQuery";
import { saveView, type View } from "@/lib/preferences";
import type { Access } from "@/lib/access";
import type { DirectorySummary, User, UserPage } from "@/types";
import AccessNotice from "./AccessNotice";
import DeleteUserDialog from "./DeleteUserDialog";
import UserCards from "./UserCards";
import UserFormModal from "./UserFormModal";
import UserStats from "./UserStats";
import UserTable from "./UserTable";
import UserToolbar, { type QueryPatch } from "./UserToolbar";

export default function UserDirectory({
  result,
  summary,
  initialView,
  access,
  accessRequested = false,
}: {
  result: UserPage;
  summary: DirectorySummary;
  initialView: View;
  access: Access;
  /** Just back from authentik's "Request access" page. */
  accessRequested?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useQueryStates(listQueryParsers, { shallow: false, startTransition });
  const [view, setView] = useState(initialView);

  /** undefined = form closed, null = adding, User = editing. */
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<User | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Visitors (and people signed in without edit access) get the same forms; the server refuses
  // their changes with a message.
  const { canEdit } = access;
  const openAdd = useCallback(() => setEditing(null), []);
  const focusSearch = useCallback(() => searchRef.current?.focus(), []);
  useShortcut("n", openAdd);
  useShortcut("/", focusSearch);

  const update: QueryPatch = (patch, options) =>
    setQuery({ ...patch, page: patch.page ?? null }, options);

  const changeView = (next: View) => {
    setView(next);
    saveView(next);
  };

  const goToPage = (page: number) => {
    update({ page });
    const top = listTopRef.current;
    if (top && top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const actions = { onEdit: setEditing, onDelete: setDeleting };
  const searchText = query.q.trim();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Browse, add and manage everyone in one place.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn btn-primary self-start sm:self-auto"
          title="Add user (N)"
        >
          <Plus className="size-4" />
          Add user
        </button>
      </div>

      {!canEdit && <AccessNotice access={access} requested={accessRequested} />}

      <UserStats summary={summary} />

      <div ref={listTopRef} className="scroll-mt-20" />

      {summary.people === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Users}
            title="No users yet"
            action={
              <button onClick={openAdd} className="btn btn-primary">
                <Plus className="size-4" />
                Add user
              </button>
            }
          >
            Add your first user to get started.
          </EmptyState>
        </div>
      ) : (
        <>
          <UserToolbar
            summary={summary}
            query={query}
            onChange={update}
            resultCount={result.total}
            view={view}
            onViewChange={changeView}
            searchRef={searchRef}
          />

          <div
            className={clsx("mt-4 transition-opacity", isPending && "opacity-60")}
            aria-busy={isPending}
          >
            {result.total === 0 ? (
              <EmptyState
                icon={SearchX}
                tone="accent"
                title={
                  searchText ? `No one matches “${searchText}”` : "No one matches these filters"
                }
                action={
                  <button
                    type="button"
                    onClick={() => update({ q: null, ...NO_FILTERS })}
                    className="btn btn-secondary"
                  >
                    Clear search and filters
                  </button>
                }
              >
                Try fewer words, a different spelling, or removing a filter.
              </EmptyState>
            ) : (
              <>
                {view === "table" ? (
                  <UserTable
                    users={result.items}
                    terms={result.terms}
                    sort={query.sort}
                    onSortChange={(sort) => update({ sort })}
                    {...actions}
                  />
                ) : (
                  <UserCards users={result.items} terms={result.terms} {...actions} />
                )}
                <Pagination
                  page={result.page}
                  pageCount={result.pageCount}
                  from={result.from}
                  to={result.to}
                  total={result.total}
                  pageSize={query.size}
                  pageSizes={PAGE_SIZES}
                  onPageChange={goToPage}
                  onPageSizeChange={(size) => update({ size: size as (typeof PAGE_SIZES)[number] })}
                />
              </>
            )}
          </div>
        </>
      )}

      <UserFormModal
        isOpen={editing !== undefined}
        user={editing}
        onClose={() => setEditing(undefined)}
        access={access}
      />
      <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />
    </main>
  );
}
