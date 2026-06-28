import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ClientDashboardRedirect from "@/app/components/ClientDashboardRedirect";
import { getOrganizationsByUserId } from "@/lib/organization/service";
import { getUser } from "@/lib/user/service";
import { getUserWorkspaces } from "@/lib/workspace/service";
import { authOptions } from "@/modules/auth/lib/authOptions";
import { ClientLogout } from "@/modules/ui/components/client-logout";

const Page = async () => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return redirect("/auth/login");
  }

  const user = await getUser(session.user.id);
  if (!user) {
    return <ClientLogout />;
  }

  const userOrganizations = await getOrganizationsByUserId(session.user.id);

  if (userOrganizations.length === 0) {
    return redirect("/setup/organization/create");
  }

  const allWorkspaceIds: string[] = [];
  for (const org of userOrganizations) {
    const workspaces = await getUserWorkspaces(user.id, org.id);
    for (const ws of workspaces) {
      allWorkspaceIds.push(ws.id);
    }
  }

  if (allWorkspaceIds.length === 0) {
    return redirect(`/organizations/${userOrganizations[0].id}/landing`);
  }

  return <ClientDashboardRedirect userWorkspaceIds={allWorkspaceIds} targetPathSuffix="/surveys" />;
};

export default Page;
