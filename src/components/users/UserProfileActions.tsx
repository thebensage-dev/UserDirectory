"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Access } from "@/lib/access";
import type { User } from "@/types";
import DeleteUserDialog from "./DeleteUserDialog";
import UserFormModal from "./UserFormModal";

export default function UserProfileActions({ user, access }: { user: User; access: Access }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Visitors get the same form and dialog; the server refuses their changes with a message.
  const edit = () => setEditing(true);
  const remove = () => setDeleting(true);

  return (
    <div className="flex shrink-0 gap-2">
      <button type="button" onClick={edit} className="btn btn-secondary">
        <Pencil className="size-4" />
        Edit
      </button>
      <button type="button" onClick={remove} className="btn btn-danger-outline">
        <Trash2 className="size-4" />
        Delete
      </button>

      <UserFormModal
        isOpen={editing}
        user={user}
        onClose={() => setEditing(false)}
        access={access}
      />
      <DeleteUserDialog
        user={deleting ? user : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => router.push("/users")}
      />
    </div>
  );
}
