"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@thebensage-dev/ui";
import { fill } from "@thebensage-dev/cms-client";
import { accessMailto } from "@/lib/access";
import Template from "./Template";
import { useDirectoryText } from "./DirectoryText";
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
  const { shared } = useDirectoryText();
  const text = shared.delete;
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
            description: fill(text.refused, { name: user.fullName }),
            action: {
              label: text.emailForAccess,
              onClick: () => location.assign(accessMailto(shared)),
            },
          });
          return;
        }
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
      } catch {
        toast.error(fill(text.failed, { name: user.fullName }));
        return;
      }
      toast.success(fill(text.deleted, { name: user.fullName }));
      onClose();
      onDeleted?.();
    });

  return (
    <ConfirmDialog
      open={user !== null}
      title={text.title}
      description={
        <Template
          text={text.body}
          values={{
            name: <strong className="font-medium text-foreground">{user?.fullName}</strong>,
          }}
        />
      }
      confirmLabel={text.confirm}
      busyLabel={text.busy}
      cancelLabel={text.cancel}
      busy={busy}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}
