import { RoleProvider } from "./context/RoleContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";

export default function App() {
  return (
    <RoleProvider>
      <AppShell />
    </RoleProvider>
  );
}
