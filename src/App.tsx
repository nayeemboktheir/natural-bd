import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { store } from '@/store/store';
import { AuthProvider } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { FacebookPixelTracker } from '@/components/tracking/FacebookPixelTracker';
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import MyAccountPage from "./pages/MyAccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Admin pages
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminIncompleteOrders from '@/pages/admin/AdminIncompleteOrders';
import AdminCourierHistory from '@/pages/admin/AdminCourierHistory';
import AdminCourierSettings from '@/pages/admin/AdminCourierSettings';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminShopSettings from '@/pages/admin/AdminShopSettings';
import AdminMarketing from '@/pages/admin/AdminMarketing';
import AdminSMS from '@/pages/admin/AdminSMS';
import AdminLandingPages from '@/pages/admin/AdminLandingPages';
import AdminLandingPageEditor from '@/pages/admin/AdminLandingPageEditor';
import AdminContactSubmissions from '@/pages/admin/AdminContactSubmissions';
import AdminSiteSettings from '@/pages/admin/AdminSiteSettings';
import AdminSocialMedia from '@/pages/admin/AdminSocialMedia';
import AdminReports from '@/pages/admin/AdminReports';
import AdminHomePageEdit from '@/pages/admin/AdminHomePageEdit';
import LandingPage from '@/pages/LandingPage';
import SocialChatWidget from '@/components/SocialChatWidget';
import FaviconLoader from '@/components/FaviconLoader';
const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/incomplete-orders" element={<AdminIncompleteOrders />} />
          <Route path="/admin/contact-submissions" element={<AdminContactSubmissions />} />
          <Route path="/admin/landing-pages" element={<AdminLandingPages />} />
          <Route path="/admin/landing-pages/:id" element={<AdminLandingPageEditor />} />
          <Route path="/admin/courier-history" element={<AdminCourierHistory />} />
          <Route path="/admin/courier-settings" element={<AdminCourierSettings />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/admin/marketing" element={<AdminMarketing />} />
          <Route path="/admin/sms" element={<AdminSMS />} />
          <Route path="/admin/social-media" element={<AdminSocialMedia />} />
          <Route path="/admin/shop-settings" element={<AdminShopSettings />} />
          <Route path="/admin/site-settings" element={<AdminSiteSettings />} />
          <Route path="/admin/home-page-edit" element={<AdminHomePageEdit />} />
          
        </Routes>
      </AdminLayout>
    );
  }

  // Check if it's a landing page route (no header/footer)
  const isLandingPageRoute = location.pathname.startsWith('/lp/');

  if (isLandingPageRoute) {
    return (
      <>
        <Routes>
          <Route path="/lp/:slug" element={<LandingPage />} />
        </Routes>
        <SocialChatWidget />
      </>
    );
  }

  return (
    <>
      <FacebookPixelTracker />
      <Header />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/my-account" element={<MyAccountPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <SocialChatWidget />
    </>
  );
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <FaviconLoader />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
