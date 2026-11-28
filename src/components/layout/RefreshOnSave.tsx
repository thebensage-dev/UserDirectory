"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

/** While previewing inside the CMS's Live Preview: redraws the page each time the editor's draft
 *  autosaves, so it follows along as they type. `cmsUrl` is the CMS's public address. */
export default function RefreshOnSave({ cmsUrl }: { cmsUrl: string }) {
  const router = useRouter();
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={cmsUrl} />;
}
