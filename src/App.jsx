import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RoleProvider } from "./context/RoleContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <AppShell />
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
