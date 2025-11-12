import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CalculatorScenario, InsertCalculatorScenario } from "@shared/schema";

export function useCalculatorScenarios(userId?: string) {
  const url = userId ? `/api/calculator/scenarios?userId=${userId}` : '/api/calculator/scenarios';
  return useQuery<CalculatorScenario[]>({
    queryKey: userId ? ['/api/calculator/scenarios', userId] : ['/api/calculator/scenarios'],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch scenarios');
      const data = await response.json();
      // Convert serialized dates to Date objects
      return data.map((scenario: any) => ({
        ...scenario,
        createdAt: new Date(scenario.createdAt),
      }));
    },
    enabled: true,
  });
}

export function useCalculatorScenario(id: string) {
  return useQuery<CalculatorScenario>({
    queryKey: ['/api/calculator/scenarios', id],
    queryFn: async () => {
      const response = await fetch(`/api/calculator/scenarios/${id}`);
      if (!response.ok) throw new Error('Failed to fetch scenario');
      const data = await response.json();
      // Convert serialized dates to Date objects
      return {
        ...data,
        createdAt: new Date(data.createdAt),
      };
    },
    enabled: !!id,
  });
}

export function useCreateCalculatorScenario() {
  return useMutation({
    mutationFn: async (data: InsertCalculatorScenario) =>
      apiRequest(`/api/calculator/scenarios`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/scenarios'] });
    },
  });
}

export function useDeleteCalculatorScenario() {
  return useMutation({
    mutationFn: async (id: string) =>
      apiRequest(`/api/calculator/scenarios/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/scenarios'] });
    },
  });
}
