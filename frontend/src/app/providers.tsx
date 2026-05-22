"use client";

import { useState } from "react";

import { IProvidersProps } from "@/types/forms";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/queryClient";
import { SocketProvider } from "@/providers/SocketProvider";
import { ProfileSyncProvider } from "@/providers/ProfileSyncProvider";
import { Toaster } from "react-hot-toast";

export const Providers = ({ children }: IProvidersProps) => {
  const [queryClient] = useState<QueryClient>(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <ProfileSyncProvider>
          {children}
          <Toaster position="bottom-right" reverseOrder={false} />
        </ProfileSyncProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
};
