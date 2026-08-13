import { createContext, useContext, useMemo, useState } from "react";
import { CURRENT_USER_BY_ROLE } from "../data/mockData.js";
import { useAuth } from "./AuthContext.jsx";

export const ROLES = {
  ATHLETE: "athlete",
  COACH: "coach",
  ADMIN: "admin",
};

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const auth = useAuth();
  const [demoRole, setDemoRole] = useState(ROLES.ATHLETE);

  // If user is authenticated in AuthContext, prioritize authenticated user & role
  const activeRole = auth.isAuthenticated ? auth.role : demoRole;
  const activeUser = auth.isAuthenticated ? auth.user : CURRENT_USER_BY_ROLE[activeRole];

  const value = useMemo(
    () => ({
      role: activeRole,
      setRole: (newRole) => {
        if (auth.isAuthenticated) {
          console.warn(`User is logged in as '${auth.role}'. Switch account to view another role.`);
        }
        setDemoRole(newRole);
      },
      user: activeUser,
      isAuthenticated: auth.isAuthenticated,
      logout: auth.logout,
    }),
    [activeRole, activeUser, auth]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
