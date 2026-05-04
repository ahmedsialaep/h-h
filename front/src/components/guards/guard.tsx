// src/components/guards/guards.tsx
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hook";
import Loading from "@/components/Loading";

// ─── Protected Route ──────────────────────────────────────────────────────────
export const ProtectedRoute = ({
  children,
  requireAuth = false,
  require2FA = false,
  adminOnly = false,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  require2FA?: boolean;
  adminOnly?: boolean;
}) => {
  const { user, restoringSession } = useAppSelector((state) => state.auth);

  if (restoringSession) return <Loading fullScreen size="lg" />;
  if (requireAuth && !user) return <Navigate to="/login" replace />;
  if (require2FA && user && !user.verified2FA) return <Navigate to="/2fa" replace />;
  if (adminOnly && user && !user.isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// ─── Public Route (login / signup) ───────────────────────────────────────────
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, restoringSession } = useAppSelector((state) => state.auth);

  if (restoringSession) return <Loading fullScreen size="lg" />;
  if (user && user.verified2FA) return <Navigate to="/" replace />;
  if (user && !user.verified2FA) return <Navigate to="/2fa" replace />;

  return <>{children}</>;
};

// ─── 2FA Route ────────────────────────────────────────────────────────────────
export const TwoFARoute = ({ children }: { children: React.ReactNode }) => {
  const { user, restoringSession } = useAppSelector((state) => state.auth);

  if (restoringSession) return <Loading fullScreen size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.verified2FA) return <Navigate to="/" replace />;

  return <>{children}</>;
};