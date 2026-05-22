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
  isSyncing: boolean;
  login: (user: IUser, token: string) => void;
  setUser: (user: IUser) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  setSyncing: (state: boolean) => void;
}
