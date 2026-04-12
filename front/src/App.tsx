import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { persistor, store } from "@/store/store";
import { restoreSession } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hook";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Loading from "./components/Loading";

// Pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import NewArrivals from "./pages/NewArrivals";
import About from "./pages/About";
import GenderCollection from "./pages/GenderCollection";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/product/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";

import NotFound from "./pages/NotFound";
import { fetchCart } from "./store/CartSlice";
import { PersistGate } from "redux-persist/integration/react";
import { fetchProducts } from "./store/productSlice";

const queryClient = new QueryClient();


// ✅ SINGLE CLEAN PROTECTED ROUTE
const ProtectedRoute = ({
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

  // ⏳ Wait for session restore (CRITICAL to avoid wrong redirects)
  if (restoringSession) {
    return <Loading fullScreen size="lg" />;
  }

  // 🔐 Auth required
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // 🔑 2FA required
  if (require2FA && user && !user.verified2FA) {
    return <Navigate to="/2fa" replace />;
  }

  // 👑 Admin only
  if (adminOnly && user && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


// 🚫 Public route (login / signup)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, restoringSession } = useAppSelector((state) => state.auth);

  if (restoringSession) {
    return <Loading fullScreen size="lg" />;
  }

  if (user && user.verified2FA) {
    return <Navigate to="/" replace />;
  }

  if (user && !user.verified2FA) {
    return <Navigate to="/2fa" replace />;
  }

  return <>{children}</>;
};


// 🔐 2FA Route
const TwoFARoute = ({ children }: { children: React.ReactNode }) => {
  const { user, restoringSession } = useAppSelector((state) => state.auth);

  if (restoringSession) {
    return <Loading fullScreen size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.verified2FA) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


const AppContent = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth require2FA adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>


        {/* ================= PUBLIC + USER ================= */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <CartDrawer />

              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/collection/:gender" element={<GenderCollection />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/about" element={<About />} />

                {/* 🔓 PUBLIC */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/sign-up"
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  }
                />

                {/* 🔐 2FA */}
                <Route
                  path="/2fa"
                  element={
                    <TwoFARoute>
                      <TwoFactorAuth />
                    </TwoFARoute>
                  }
                />

                {/* 🔐 USER PROTECTED */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requireAuth require2FA>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute requireAuth require2FA>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute requireAuth require2FA>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/order-tracking"
                  element={
                    <ProtectedRoute requireAuth>
                      <OrderTracking />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>

              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};


const App = () => (
  <Provider store={store}>
    <PersistGate loading={<Loading fullScreen size="lg" />} persistor={persistor}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;