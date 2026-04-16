import { ReactNode } from "react";


export interface IProvidersProps {
  children: ReactNode;
}

export interface ILoginForm {
  email: string;
  password: string;
  role: "bidder" | "seller";
}

export interface IRegisterForm {
  name: string;
  email: string;
  password: string;
  role: "bidder" | "seller";
}
