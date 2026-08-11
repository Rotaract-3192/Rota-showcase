"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * Server Action to dispatch a notification to a specific user.
 * Can be called by other server actions (e.g. when an access request is approved).
 */
export async function notifyUserAction(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  const supabaseAdmin = await createServerSupabaseClient();
  const { data, error } = await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    title,
    message,
    link,
    is_read: false,
  });

  if (error) {
    console.error("Error creating user notification:", error);
    throw error;
  }
  return data;
}

/**
 * Server Action to dispatch a broadcast notification to a specific role.
 */
export async function notifyRoleAction(
  roleTarget: string,
  title: string,
  message: string,
  link?: string
) {
  const supabaseAdmin = await createServerSupabaseClient();
  const { data, error } = await supabaseAdmin.from("notifications").insert({
    role_target: roleTarget,
    title,
    message,
    link,
    is_read: false,
  });

  if (error) {
    console.error("Error creating role notification:", error);
    throw error;
  }
  return data;
}

/**
 * Server Action for users to mark their own notifications as read.
 */
export async function markNotificationReadAction(notificationId: string) {
  const supabaseAdmin = await createServerSupabaseClient();
  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    throw error;
  }
  
  revalidatePath("/", "layout");
}

/**
 * Server Action to mark all notifications as read for the current user.
 */
export async function markAllNotificationsReadAction() {
  const supabaseAdmin = await createServerSupabaseClient();
  const { data: { user } } = await supabaseAdmin.auth.getUser();
  
  if (!user) return;

  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
  
  revalidatePath("/", "layout");
}
