"use client";

import { useState } from "react";

import { IProvidersProps } from "@/types/forms";

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/queryClient";

export const Providers = ({ children }: IProvidersProps) => {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
