export interface IRegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: any; // We can improve this further with IUserDocument
  token: string;
}
