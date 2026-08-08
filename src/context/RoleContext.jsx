import { createContext, useContext, useMemo, useState } from "react";
import { CURRENT_USER_BY_ROLE } from "../data/mockData.js";

export const ROLES = {
  ATHLETE: "athlete",
  COACH: "coach",
  ADMIN: "admin",
};

const RoleContext = createContext(null);

/**
 * Owns the "which dashboard am I looking at" state for the whole app.
 *
 * In production this shouldn't be a free client-side switch — it should be
 * derived from the authenticated user's role coming back from FastAPI
 * (GET /me). It's exposed as a switcher here purely so the prototype can
 * demo all three dashboards in one session. Swap `setRole` for a real
 * session/auth hook later; nothing downstream needs to change since every
 * consumer reads role + user from this context, never from local state.
 */
export function RoleProvider({ children }) {
  const [role, setRole] = useState(ROLES.ATHLETE);

  const value = useMemo(
    () => ({
      role,
      setRole,
      user: CURRENT_USER_BY_ROLE[role],
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
