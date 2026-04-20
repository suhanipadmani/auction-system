import { axiosClient } from "../lib/axios";

export const notificationApi = {
  getMyNotifications: async (params: { page?: number; limit?: number } = {}) => {
    const response = await axiosClient.get("/notifications", { params });
    return { data: response.data.data, ...response.data.meta };
  },

  markRead: async (id: string) => {
    const response = await axiosClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await axiosClient.patch("/notifications/read-all");
    return response.data;
  },
};
