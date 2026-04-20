import { axiosClient } from "@/lib/axios";

export const userApi = {
  getAllUsers: async (includeDeleted = false, page = 1, limit = 20, search = "") => {
    const params: any = { page, limit };
    if (includeDeleted) params.includeDeleted = "true";
    if (search) params.search = search;
    
    const response = await axiosClient.get("/users", { params });
    return { data: response.data.data, ...response.data.meta };
  },

  createUser: async (data: { name: string; email: string; password?: string; role: string }) => {
    const payload = { ...data, password: data.password };
    const response = await axiosClient.post("/users", payload);
    return response.data;
  },

  updateUserRole: async ({ id, role }: { id: string; role: string }) => {
    const response = await axiosClient.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  /* Deactivate */
  deactivateUser: async (id: string) => {
    const response = await axiosClient.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  /* Activate */
  activateUser: async (id: string) => {
    const response = await axiosClient.patch(`/users/${id}/activate`);
    return response.data;
  },

  /* Soft-delete */
  deleteUser: async (id: string) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },

  /* Restore */
  restoreUser: async (id: string) => {
    const response = await axiosClient.patch(`/users/${id}/restore`);
    return response.data;
  },
};
