import { useQuery } from "@tanstack/react-query";
import type { Vendor } from "@shared/schema";

export function useVendors(category?: string) {
  return useQuery<Vendor[]>({
    queryKey: ["/api/vendors", category],
    queryFn: async () => {
      let url = "/api/vendors";
      if (category) url += `?category=${category}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch vendors");
      return response.json();
    },
  });
}
