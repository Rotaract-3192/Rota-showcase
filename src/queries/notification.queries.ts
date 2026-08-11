import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseClient } from "@/lib/supabase";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/actions/notification.actions";
import type { Database } from "@/types/database.types";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: string) => [...notificationKeys.lists(), filters] as const,
  detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
};

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

import { useAuthContext } from "@/components/providers/auth-provider";

export function useNotifications() {
  const supabase = createSupabaseClient();
  const { profileData } = useAuthContext();

  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: async () => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const roles = profileData?.primaryRole ? [profileData.primaryRole] : [];

      // Query for notifications meant for this user OR meant for one of their roles
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (roles.length > 0) {
        query = query.or(`user_id.eq.${user.id},role_target.in.(${roles.join(',')})`);
      } else {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Notification[];
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationReadAction(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsReadAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
