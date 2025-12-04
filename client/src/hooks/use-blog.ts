import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogPost, InsertBlogPost } from "@shared/schema";

export function useBlogPosts(type?: string, category?: string) {
  return useQuery<BlogPost[]>({
    queryKey: ["/api/blog", type, category],
    queryFn: async () => {
      let url = "/api/blog";
      const params = new URLSearchParams();
      if (type) params.append("type", type);
      if (category) params.append("category", category);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });
}

export function useCreateBlogPost() {
  return useMutation({
    mutationFn: async (post: InsertBlogPost) => {
      return apiRequest("POST", "/api/blog", post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
  });
}

export function useGenerateBlogContent() {
  return useMutation({
    mutationFn: async ({ topic, category }: { topic: string; category: string }) => {
      return apiRequest("POST", "/api/blog/generate", { topic, category });
    },
  });
}

export function useBlogPost(idOrSlug: string) {
  return useQuery<BlogPost>({
    queryKey: ["/api/blog", "post", idOrSlug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${idOrSlug}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      return response.json();
    },
    enabled: !!idOrSlug,
  });
}

export function useUpdateBlogPost() {
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertBlogPost> & { id: string }) => {
      return apiRequest("PATCH", `/api/blog/${id}`, data);
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the list and the specific post
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog", "post", variables.id] });
    },
  });
}

export function useDeleteBlogPost() {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/blog/${id}`);
    },
    onSuccess: (_data, id) => {
      // Invalidate both the list and the specific post
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog", "post", id] });
    },
  });
}
