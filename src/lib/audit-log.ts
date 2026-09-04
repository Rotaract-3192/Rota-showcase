function titleCaseAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function describeAuditAction(log: {
  action?: string | null;
  table_name?: string | null;
  new_data?: unknown;
}) {
  const action = (log.action || "").trim();
  const table = log.table_name || "record";
  let payload: any = log.new_data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = null;
    }
  }

  const upper = action.toUpperCase();
  if (upper === "APPROVE_ACCESS" && payload?.user_email) {
    return `Approved access for ${payload.user_email}${payload.role ? ` as ${payload.role}` : ""}`;
  }
  if (upper === "REJECT_ACCESS" && payload?.user_email) {
    return `Rejected access for ${payload.user_email}`;
  }

  const labels: Record<string, string> = {
    UPDATE: "updated",
    CREATE: "created",
    INSERT: "created",
    DELETE: "deleted",
    DELETE_MEMBER: "removed a member from",
    CREATE_MEMBER: "added a member in",
    INVITE_USER: "invited a user in",
    APPROVE_ACCESS: "approved an access request in",
    REJECT_ACCESS: "rejected an access request in",
  };

  const verb = labels[upper] || `${titleCaseAction(action)} on`;
  return `${verb} ${table}`.replace(/\s+/g, " ").trim();
}

export function auditActorName(profile: { first_name?: string | null; last_name?: string | null } | null | undefined) {
  if (!profile) return "System";
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "System";
}
