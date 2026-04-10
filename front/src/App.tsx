import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "@/store/store";
import { restoreSession } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import NewArrivals from "./pages/NewArrivals";
import About from "./pages/About";
import GenderCollection from "./pages/GenderCollection";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/product/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import Loading from "./components/Loading";
import api from "./services/http-common";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import { fetchCart } from "./store/CartSlice";
import OrderTracking from "./pages/OrderTracking";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }: {
    children: React.ReactNode;
    adminOnly?: boolean;
}) => {
    const { user, restoringSession } = useAppSelector((state) => state.auth);
    if(restoringSession) return <Loading/>;
    if (!user) return <Navigate to="/login" replace />;
    if (!user.verified2FA) return <Navigate to="/2fa" replace />;
    if (adminOnly && !user.isAdmin) return <Loading fullScreen size="lg" />;
    if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;

    return <>{children}</>;
};
const TwoFARoute = ({ children }: { children: React.ReactNode }) => {
    const { user, restoringSession } = useAppSelector((state) => state.auth);
    if(restoringSession) return <Loading/>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.verified2FA) return <Navigate to="/" replace />;

    return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, restoringSession } = useAppSelector((state) => state.auth);

    if (restoringSession) return <Loading fullScreen size="lg" />;
    if (user && user.verified2FA) return <Navigate to="/" replace />;
    if (user && !user.verified2FA) return <Navigate to="/2fa" replace />;

    return <>{children}</>;
};
const AppContent = () => {
    const dispatch = useAppDispatch();
    const { user, loading,restoringSession } = useAppSelector((state) => state.auth);

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
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>

                        <AdminLayout />

                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={
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
                            <Route path="/login" element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            } />
                            <Route path="/sign-up" element={
                                <PublicRoute>
                                    <Signup />
                                </PublicRoute>
                            } />
                            <Route path="/2fa" element={
                                <TwoFARoute>
                                    <TwoFactorAuth />
                                </TwoFARoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                            <Route path="/orders" element={
                                <ProtectedRoute>
                                    <Orders />
                                </ProtectedRoute>
                            } />

                            <Route path="/checkout" element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            } />
                            <Route path="/order-tracking" element={
                                <ProtectedRoute>
                                    <OrderTracking />
                                </ProtectedRoute>
                            } />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                        <Footer />
                    </>
                } />
            </Routes>
        </BrowserRouter>
    );
};

const App = () => (
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>

                <Toaster />
                <Sonner />
                <AppContent />

            </TooltipProvider>
        </QueryClientProvider>
    </Provider>
);

export default App;