import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Settings, ArrowLeft, Menu, X, LogOut, Layers, Tags } from "lucide-react";
import { useState } from "react";
import { logoutUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hook";

const sidebarLinks = [
  { label: "Tableau de Bord", href: "/admin", icon: LayoutDashboard },
  { label: "Produits", href: "/admin/products", icon: Package },
  { label: "Marques", href: "/admin/brands", icon: Tags },
  { label: "Catégories", href: "/admin/categories", icon: Layers },
  { label: "Commandes", href: "/admin/orders", icon: ShoppingCart },
  { label: "Paramètres", href: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-heading font-black text-lg tracking-tight text-foreground">
            JUMEAUX<span className="text-primary"> ADMIN</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href || (link.href !== "/admin" && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading text-sm uppercase tracking-wider transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          <button
            onClick={() => dispatch(logoutUser())}
            className="flex items-center gap-2 w-full px-4 py-3 text-muted-foreground hover:text-destructive font-heading text-sm uppercase tracking-wider transition-colors rounded-lg hover:bg-destructive/10"
          >
            <LogOut size={16} /> Déconnexion
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground font-heading text-sm uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={16} /> Retour au Site
          </Link>
        </div>

      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border flex items-center px-4 md:px-6 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-foreground">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
            Panneau d'Administration
          </h2>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
