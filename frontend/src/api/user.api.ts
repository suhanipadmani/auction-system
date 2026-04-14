import { axiosClient } from "@/lib/axios";

export const userApi = {
  getAllUsers: async () => {
    const response = await axiosClient.get("/users");
    return response.data;
  },
  
  createUser: async (data: { name: string; email: string; password?: string; role: string }) => {
    // If not establishing a password, provide a fallback one for internal manual creations
    const payload = { ...data, password: data.password || "defaultPass123" };
    const response = await axiosClient.post("/users", payload);
    return response.data;
  },

  updateUserRole: async ({ id, role }: { id: string; role: string }) => {
    const response = await axiosClient.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  deactivateUser: async (id: string) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  }
};
