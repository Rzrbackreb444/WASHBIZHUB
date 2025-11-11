import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CleanbiScore, InsertCleanbiScore } from "@shared/schema";

export function useCleanbiScores(userId?: string) {
  return useQuery<CleanbiScore[]>({
    queryKey: userId ? ["/api/cleanbi", userId] : ["/api/cleanbi"],
    queryFn: async () => {
      const url = userId ? `/api/cleanbi?userId=${userId}` : "/api/cleanbi";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch scores");
      return response.json();
    },
  });
}

export function useCreateCleanbiScore() {
  return useMutation({
    mutationFn: async (score: InsertCleanbiScore) => {
      return apiRequest("POST", "/api/cleanbi", score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cleanbi"] });
    },
  });
}

export function useGenerateInsights() {
  return useMutation({
    mutationFn: async (scoreId: string) => {
      return apiRequest("POST", `/api/cleanbi/${scoreId}/insights`, {});
    },
  });
}
