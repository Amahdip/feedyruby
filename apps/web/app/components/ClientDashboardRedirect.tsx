"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SALAMRUBY_WORKSPACE_ID_LS } from "@/lib/localStorage";

interface ClientDashboardRedirectProps {
  userWorkspaceIds: string[];
  targetPathSuffix?: string;
}

const ClientDashboardRedirect = ({
  userWorkspaceIds,
  targetPathSuffix = "",
}: ClientDashboardRedirectProps) => {
  const router = useRouter();

  useEffect(() => {
    const lastWorkspaceId = localStorage.getItem(SALAMRUBY_WORKSPACE_ID_LS);

    if (lastWorkspaceId && userWorkspaceIds.includes(lastWorkspaceId)) {
      router.push(`/workspaces/${lastWorkspaceId}${targetPathSuffix}`);
    } else {
      localStorage.removeItem(SALAMRUBY_WORKSPACE_ID_LS);
      if (userWorkspaceIds.length > 0) {
        router.push(`/workspaces/${userWorkspaceIds[0]}${targetPathSuffix}`);
      } else {
        router.push("/");
      }
    }
  }, [userWorkspaceIds, targetPathSuffix, router]);

  return null;
};

export default ClientDashboardRedirect;
