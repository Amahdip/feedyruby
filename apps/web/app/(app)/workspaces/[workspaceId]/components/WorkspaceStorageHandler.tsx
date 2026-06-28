"use client";

import { useEffect } from "react";
import { FEEDYRUBY_ENVIRONMENT_ID_LS, FEEDYRUBY_WORKSPACE_ID_LS } from "@/lib/localStorage";

interface WorkspaceStorageHandlerProps {
  workspaceId: string;
}

const WorkspaceStorageHandler = ({ workspaceId }: WorkspaceStorageHandlerProps) => {
  useEffect(() => {
    localStorage.setItem(FEEDYRUBY_WORKSPACE_ID_LS, workspaceId);
    // Keep legacy environment ID in sync for backward compatibility with old SDK clients
    localStorage.setItem(FEEDYRUBY_ENVIRONMENT_ID_LS, workspaceId);
  }, [workspaceId]);

  return null;
};

export default WorkspaceStorageHandler;
