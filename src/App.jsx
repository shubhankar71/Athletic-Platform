import { AuthProvider } from "./context/AuthContext.jsx";
import { RoleProvider } from "./context/RoleContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <AppShell />
      </RoleProvider>
    </AuthProvider>
  );
}
