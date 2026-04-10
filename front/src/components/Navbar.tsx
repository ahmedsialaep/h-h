import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, User, ChevronDown, LogOut, Warehouse, UserCog, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { logoutUser } from "@/store/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleCart } from "@/store/CartSlice";

const navLinks = [
  {
    label: "Boutique",
    href: "/shop",
    children: [
      { label: "Homme", href: "/collection/homme" },
      { label: "Femme", href: "/collection/femme" },
      { label: "Enfant", href: "/collection/enfant" },
      { label: "Tous les Produits", href: "/shop" },
    ],
  },
  { label: "Nouveautés", href: "/new-arrivals" },
  { label: "À Propos", href: "/about" },
];

const Navbar = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const dispatch = useAppDispatch();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const totalItems = useAppSelector((state) => {
    const items = state.cart.cart?.cartItemDtos ?? [];
    return items.reduce((acc, i) => acc + i.quantity, 0);
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(null);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };
  
  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="font-heading font-black text-xl md:text-2xl tracking-tight text-foreground">
              JUMEAUX<span className="text-primary"> SPORTS</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.children && setDropdownOpen(link.href)}
                  onMouseLeave={() => setDropdownOpen(null)}
                >
                  <Link
                    to={link.href}
                    className={`font-heading font-semibold text-sm tracking-widest uppercase transition-colors hover:text-primary flex items-center gap-1 ${
                      location.pathname === link.href || location.pathname.startsWith("/collection")
                        ? link.href === "/shop" ? "text-primary" : location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={12} />}
                  </Link>

                  {link.children && dropdownOpen === link.href && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 pt-2"
                    >
                      <div className="bg-card border border-border rounded-lg py-2 min-w-[180px] shadow-xl">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="block px-4 py-2.5 text-sm font-heading uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop right actions */}
            <div className="flex items-center gap-3">
              {/* Admin shortcut or Search */}
              <button
                onClick={() => user?.isAdmin ? navigate("/admin") : null}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden md:block"
              >
                {user?.isAdmin ? <Warehouse size={20} /> : <Search size={20} />}
              </button>

              {/* User dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-2 p-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-accent/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary uppercase">
                          {user.username?.charAt(0) || "U"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground font-heading uppercase tracking-wider">
                        {user.username}
                      </span>
                      <ChevronDown size={12} className="text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-foreground">
                        {user.nom} {user.prenom}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.username}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer gap-2 py-2.5"
                    >
                      <UserCog size={16} />
                      Mon Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/orders")}
                      className="cursor-pointer gap-2 py-2.5"
                    >
                      <Package size={16} />
                      Mes Commandes
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="cursor-pointer gap-2 py-2.5"
                        >
                          <Warehouse size={16} />
                          Administration
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer gap-2 py-2.5 text-destructive focus:text-destructive"
                    >
                      <LogOut size={16} />
                      Se Déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden md:block"
                >
                  <User size={20} />
                </Link>
              )}

              {/* Cart button */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-foreground"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background pt-20"
          >
            <div className="flex flex-col items-center gap-6 pt-12">
              <Link to="/shop" className="font-heading font-bold text-3xl tracking-wider uppercase text-foreground hover:text-primary transition-colors">
                Boutique
              </Link>
              <div className="flex gap-4">
                <Link to="/collection/homme" className="font-heading font-semibold text-lg tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors">Homme</Link>
                <Link to="/collection/femme" className="font-heading font-semibold text-lg tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors">Femme</Link>
                <Link to="/collection/enfant" className="font-heading font-semibold text-lg tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors">Enfant</Link>
              </div>
              <Link to="/new-arrivals" className="font-heading font-bold text-3xl tracking-wider uppercase text-foreground hover:text-primary transition-colors">Nouveautés</Link>
              <Link to="/about" className="font-heading font-bold text-3xl tracking-wider uppercase text-foreground hover:text-primary transition-colors">À Propos</Link>

              {/* Mobile user actions */}
              {user ? (
                <div className="flex flex-col items-center gap-4 mt-4 pt-4 border-t border-border w-48">
                  <p className="text-sm font-semibold text-foreground">{user.nom} {user.prenom}</p>
                  <p className="text-xs text-muted-foreground">{user.username}</p>
                  <Link to="/profile" className="font-heading font-semibold text-lg tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors">
                    Mon Profil
                  </Link>
                  <Link to="/orders" className="font-heading font-semibold text-lg tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors">
                    Mes Commandes
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="font-heading font-semibold text-lg tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors">
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="font-heading font-semibold text-lg tracking-wider uppercase text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link to="/login" className="font-heading font-bold text-3xl tracking-wider uppercase text-foreground hover:text-primary transition-colors">
                  Connexion
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;