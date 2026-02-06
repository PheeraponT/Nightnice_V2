import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type MoodFeedbackInputDto, type StoreMoodInsightDto } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";

export const moodKeys = {
  all: ["mood-insight"] as const,
  insight: (storeId: string) => [...moodKeys.all, storeId] as const,
};

export function useStoreMoodInsight(storeId?: string, enabled: boolean = true) {
  const queryKey = moodKeys.insight(storeId ?? "unknown");

  return useQuery<StoreMoodInsightDto | null>({
    queryKey,
    queryFn: () => api.public.getMoodInsight(storeId!),
    enabled: Boolean(storeId) && enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useSubmitMoodFeedback(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MoodFeedbackInputDto) => {
      const token = await getIdToken();
      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนบันทึก Mood & Vibe");
      }

      return api.public.submitMoodFeedback(storeId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.insight(storeId) });
    },
  });
}
