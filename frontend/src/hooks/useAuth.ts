import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export const useLogin = () => {
  const loginFn = useAuthStore((state) => state.login);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      loginFn(data.data.user, data.data.token);
      router.push('/dashboard');
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      router.push('/login');
    },
  });
};

export const useLogout = () => {
  const logoutFn = useAuthStore((state) => state.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logoutFn();
      router.push('/login');
    },
  });
};
