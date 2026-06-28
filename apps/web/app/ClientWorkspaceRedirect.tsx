"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FEEDYRUBY_WORKSPACE_ID_LS } from "@/lib/localStorage";

interface ClientWorkspaceRedirectProps {
  userWorkspaceIds: string[];
}

const ClientWorkspaceRedirect = ({ userWorkspaceIds }: ClientWorkspaceRedirectProps) => {
  const router = useRouter();

  useEffect(() => {
    const lastWorkspaceId = localStorage.getItem(FEEDYRUBY_WORKSPACE_ID_LS);

    if (lastWorkspaceId && userWorkspaceIds.includes(lastWorkspaceId)) {
      router.push(`/workspaces/${lastWorkspaceId}`);
    } else {
      localStorage.removeItem(FEEDYRUBY_WORKSPACE_ID_LS);
      router.push(`/workspaces/${userWorkspaceIds[0]}`);
    }
  }, [userWorkspaceIds, router]);

  return null;
};

export default ClientWorkspaceRedirect;
