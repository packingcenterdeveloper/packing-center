import { useMutation } from '@tanstack/react-query';
import { login, type LoginInput } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (result) => {
      setAuth(result.token, result.email);
    },
  });
}