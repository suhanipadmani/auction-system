import { axiosClient } from "../lib/axios";

export const notificationApi = {
  getMyNotifications: async () => {
    const response = await axiosClient.get("/notifications");
    return response.data;
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
