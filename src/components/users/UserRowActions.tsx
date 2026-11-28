import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import type { User } from "@/types";
import { fill } from "@thebensage-dev/cms-client";
import { useListText } from "./DirectoryText";

export type UserActionHandlers = {
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
};

export default function UserRowActions({
  user,
  onEdit,
  onDelete,
  className,
}: UserActionHandlers & { user: User; className?: string }) {
  const { results: text } = useListText();
  if (!onEdit && !onDelete) return null;
  return (
    <div className={clsx("flex items-center gap-0.5", className)}>
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(user)}
          aria-label={fill(text.editUser, { name: user.fullName })}
          title={text.edit}
          className="icon-btn"
        >
          <Pencil className="size-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(user)}
          aria-label={fill(text.deleteUser, { name: user.fullName })}
          title={text.delete}
          className="icon-btn icon-btn-danger"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
