import { USER_STATUSES } from "../enums";

export interface ICreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
  status?: USER_STATUSES;
}

export interface IUpdateUserData {
  name?: string;
  role?: string;
  status?: USER_STATUSES;
}
