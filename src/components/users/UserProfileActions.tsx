"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Access } from "@/lib/access";
import type { UserOptions } from "@/lib/userOptions";
import type { User } from "@/types";
import DeleteUserDialog from "./DeleteUserDialog";
import { useDirectoryText } from "./DirectoryText";
import UserFormModal from "./UserFormModal";
import UserOptionsProvider from "./UserOptionsProvider";

export default function UserProfileActions({
  user,
  access,
  options,
}: {
  user: User;
  access: Access;
  options: UserOptions;
}) {
  const router = useRouter();
  const { profile, paths } = useDirectoryText();
  const text = profile?.labels;
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Visitors get the same form and dialog; the server refuses their changes with a message.
  const edit = () => setEditing(true);
  const remove = () => setDeleting(true);

  return (
    <div className="flex shrink-0 gap-2">
      <button type="button" onClick={edit} className="btn btn-secondary">
        <Pencil className="size-4" />
        {text?.edit}
      </button>
      <button type="button" onClick={remove} className="btn btn-danger-outline">
        <Trash2 className="size-4" />
        {text?.delete}
      </button>

      <UserOptionsProvider options={options}>
        <UserFormModal
          isOpen={editing}
          user={user}
          onClose={() => setEditing(false)}
          access={access}
        />
      </UserOptionsProvider>
      <DeleteUserDialog
        user={deleting ? user : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => router.push(paths.list)}
      />
    </div>
  );
}
