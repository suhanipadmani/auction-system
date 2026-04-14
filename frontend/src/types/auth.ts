export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: "active" | "deactivated";
  createdAt?: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: IUser, token: string) => void;
  logout: () => void;
}
