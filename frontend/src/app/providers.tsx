"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { createQueryClient } from "@/lib/queryClient";

import { IProvidersProps } from "@/types/forms";

export const Providers = ({ children }: IProvidersProps) => {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
