import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Tools from "./pages/Tools";
import Tickets from "./pages/Tickets";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import { isLoggedIn } from "./auth/auth";

function AppShell({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn() ? <Navigate to="/tools" replace /> : <Login />}
        />

        <Route
          path="/tools"
          element={
            <ProtectedRoute>
              <AppShell>
                <Tools />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <AppShell>
                <Tickets />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/tools" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
