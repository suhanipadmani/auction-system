import { axiosClient } from "@/lib/axios";

export const userApi = {
  getAllUsers: async (includeDeleted = false) => {
    const response = await axiosClient.get("/users", {
      params: includeDeleted ? { includeDeleted: "true" } : {},
    });
    return response.data;
  },

  createUser: async (data: { name: string; email: string; password?: string; role: string }) => {
    const payload = { ...data, password: data.password || "defaultPass123" };
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
