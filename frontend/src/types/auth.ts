import { USER_STATUSES } from "@/enums/user.enum";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: USER_STATUSES;
  createdAt?: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (user: IUser, token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}
