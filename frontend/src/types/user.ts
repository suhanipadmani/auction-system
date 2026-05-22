export interface ICreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface IUpdateUserRoleDTO {
  id: string;
  role: string;
}
