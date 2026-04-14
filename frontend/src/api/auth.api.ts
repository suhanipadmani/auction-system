import { axiosClient } from '../lib/axios';

export const authApi = {
  login: async (credentials: any) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },
};
