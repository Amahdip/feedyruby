import { Workspace } from "@feedyruby/database/prisma";

export interface TUserWorkspace extends Pick<Workspace, "id" | "name"> {}
