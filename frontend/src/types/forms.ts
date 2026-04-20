import { ReactNode } from "react";


export interface IProvidersProps {
  children: ReactNode;
}

import { USER_ROLES } from "@/enums/user.enum";

export interface ILoginForm {
  email: string;
  password: string;
  role: USER_ROLES.BIDDER | USER_ROLES.SELLER;
}

export interface IRegisterForm {
  name: string;
  email: string;
  password: string;
  role: USER_ROLES.BIDDER | USER_ROLES.SELLER;
}
