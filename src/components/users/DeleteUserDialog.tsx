"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@thebensage-dev/ui";
import { ACCESS_MAILTO } from "@/lib/access";
import { deleteUserAction } from "@/server/userActions";
import type { User } from "@/types";

export default function DeleteUserDialog({
  user,
  onClose,
  onDeleted,
}: {
  user: User | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const [busy, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      if (!user) return;
      try {
        const result = await deleteUserAction(user.id);
        if (!result.ok && result.signInRequired) {
          // Visitors can try deleting; the server refuses it and nothing changes.
          onClose();
          toast.error(result.error, {
            description: `${user.fullName} is still here: only editors can delete people.`,
            action: { label: "Email me for access", onClick: () => location.assign(ACCESS_MAILTO) },
          });
          return;
        }
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
      } catch {
        toast.error(`Couldn't delete ${user.fullName}. Please try again.`);
        return;
      }
      toast.success(`Deleted ${user.fullName}`);
      onClose();
      onDeleted?.();
    });

  return (
    <ConfirmDialog
      open={user !== null}
      title="Delete user?"
      description={
        <>
          <strong className="font-medium text-foreground">{user?.fullName}</strong> will be removed
          permanently. This can&apos;t be undone.
        </>
      }
      busy={busy}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}
