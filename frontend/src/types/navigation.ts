import { LucideIcon } from "lucide-react";
import { USER_ROLES } from "@/enums/user.enum";

export interface INavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: USER_ROLES[] | string[];
}
