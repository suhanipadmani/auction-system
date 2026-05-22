import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MESSAGES } from "../constants/messages";
import { AppMutationOptions } from "../types/common";

export function useAppMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: AppMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  const { successMessage, errorMessage, invalidateKeys, onSuccess, onError, ...rest } = options;

  return useMutation({
    ...rest,
    onSuccess: (data: any, variables, context) => {
      // 1. Extract backend message or fallback
      const message = data?.message || successMessage || MESSAGES.SUCCESS.DEFAULT;
      toast.success(message);

      // 2. Handle invalidation
      if (invalidateKeys) {
        invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // 3. Call original onSuccess
      if (onSuccess) {
        (onSuccess as any)(data, variables, context);
      }
    },
    onError: (error: any, variables, context) => {
      // 1. Extract backend error message or fallback
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;
      
      let message = backendMessage || errorMessage || MESSAGES.ERROR.DEFAULT;
      
      if (status === 429) {
        message = MESSAGES.ERROR.RATE_LIMIT;
      }
      
      toast.error(message);

      // 2. Call original onError
      if (onError) {
        (onError as any)(error, variables, context);
      }
    },
  });
}
