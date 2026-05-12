"use client";

import { useState } from "react";

import { IProvidersProps } from "@/types/forms";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/queryClient";
import { SocketProvider } from "@/providers/SocketProvider";
import { Toaster } from "react-hot-toast";

export const Providers = ({ children }: IProvidersProps) => {
  const [queryClient] = useState<QueryClient>(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        {children}
        <Toaster position="bottom-right" reverseOrder={false} />
      </SocketProvider>
    </QueryClientProvider>
  );
};
