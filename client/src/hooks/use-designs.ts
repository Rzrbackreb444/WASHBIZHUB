import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Design, InsertDesign } from "@shared/schema";

export function useDesigns(userId?: string) {
  return useQuery<Design[]>({
    queryKey: userId ? ["/api/designs", userId] : ["/api/designs"],
    queryFn: async () => {
      const url = userId ? `/api/designs?userId=${userId}` : "/api/designs";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch designs");
      return response.json();
    },
  });
}

export function useCreateDesign() {
  return useMutation({
    mutationFn: async (design: InsertDesign) => {
      return apiRequest("POST", "/api/designs", design);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designs"] });
    },
  });
}

export function useUpdateDesign() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertDesign }) => {
      return apiRequest("PUT", `/api/designs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designs"] });
    },
  });
}

export function useOptimizeDesign() {
  return useMutation({
    mutationFn: async (designId: string) => {
      return apiRequest("POST", `/api/designs/${designId}/optimize`, {});
    },
    onSuccess: (_data, designId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/designs", designId] });
    },
  });
}
