import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { fetchProducts } from "@/store/productSlice";
import { fetchCommandes } from "@/store/CommandeSlice";
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { IMAGE_API_URL } from "@/config/config";
import { STATUS_COLORS, STATUS_LABELS } from "@/models/constants/StatusConstants";

const monthlyRevenue = [
  { month: "Jan", revenue: 2400, orders: 12, profit: 720 },
  { month: "Fév", revenue: 3100, orders: 18, profit: 930 },
  { month: "Mar", revenue: 4200, orders: 24, profit: 1260 },
  { month: "Avr", revenue: 3800, orders: 20, profit: 1140 },
  { month: "Mai", revenue: 5100, orders: 30, profit: 1530 },
  { month: "Jun", revenue: 4700, orders: 27, profit: 1410 },
  { month: "Jul", revenue: 5800, orders: 35, profit: 1740 },
  { month: "Aoû", revenue: 6200, orders: 38, profit: 1860 },
  { month: "Sep", revenue: 5500, orders: 32, profit: 1650 },
  { month: "Oct", revenue: 7100, orders: 42, profit: 2130 },
  { month: "Nov", revenue: 8400, orders: 50, profit: 2520 },
  { month: "Déc", revenue: 9200, orders: 55, profit: 2760 },
];

const categoryData = [
  { name: "Running", value: 35 },
  { name: "Lifestyle", value: 28 },
  { name: "Basketball", value: 18 },
  { name: "Training", value: 12 },
  { name: "Autre", value: 7 },
];

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#6366f1", "#f59e0b", "#94a3b8"];

const Dashboard = () => {
  const dispatch = useAppDispatch();

  const products = useAppSelector((state) => state.products.items);
  const totalProducts = useAppSelector((state) => state.products.totalItems);
  const { items: orders, totalItems: totalOrders } = useAppSelector((state) => state.commande);
  const [lowStockPage, setLowStockPage] = useState(0);
  const LOW_STOCK_PAGE_SIZE = 6;
  useEffect(() => {
    dispatch(fetchProducts({
      filters: {
        page: 0,
        pageSize: 100,
        sortBy: "id",
        sortDir: "asc",
        brandIds: null,
        genres: null,
        categories: null,
        types: null,
        colors: null,
        size: null,
        minPrice: null,
        maxPrice: null,
        newArrival: null,
        marketVisible: null,
        search: null,
      },
    }));
    dispatch(fetchCommandes({
      page: 0,
      pageSize: 5,
      userId: null,
      search: null,
      status: null,
    }));
  }, [dispatch]);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  
  const lowStockProducts = products.filter((p) =>
    (p.variants ?? []).reduce((acc, v) => acc + (v.availableQuantity ?? 0), 0) <= 5
  );

  
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalYearlyProfit = monthlyRevenue.reduce((s, m) => s + m.profit, 0);

  const statCards = [
    { label: "Revenu Total", icon: DollarSign, value: `${totalRevenue.toFixed(2)} TND` },
    { label: "Commandes", icon: ShoppingCart, value: `${totalOrders}` },
    { label: "Produits", icon: Package, value: `${totalProducts}` },
    { label: "Stock Faible", icon: AlertTriangle, value: `${lowStockProducts.length}` },
  ];

  
  const lowStockTotalPages = Math.ceil(lowStockProducts.length / LOW_STOCK_PAGE_SIZE);

  const paginatedLowStock = lowStockProducts.slice(
    lowStockPage * LOW_STOCK_PAGE_SIZE,
    Math.min((lowStockPage + 1) * LOW_STOCK_PAGE_SIZE, lowStockProducts.length)
  );
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">Tableau de Bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <card.icon size={18} className="text-primary" />
              </div>
            </div>
            <p className="font-heading font-black text-2xl text-foreground">{card.value}</p>
            <p className="text-muted-foreground text-xs font-heading uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue & Profit Line Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">Revenu & Profit Annuel</h3>
            <p className="text-muted-foreground text-xs mt-1">
              Profit total: <span className="text-primary font-bold">{totalYearlyProfit} TND</span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp size={16} />
            <span className="text-xs font-heading font-bold">+24%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} name="Revenu (TND)" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" name="Profit (TND)" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Commandes par Mois</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Ventes par Catégorie</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={4} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                fontSize={11}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Area Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Évolution du Profit</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
            <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={1} fill="url(#profitGrad)" strokeWidth={2} name="Profit (TND)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Commandes Récentes</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune commande récente.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-body font-semibold text-sm text-foreground">
                      {order.userNom || order.guestFirstName} {order.userPrenom || order.guestLastName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {order.ref} • {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-sm text-foreground">{order.totalPrice.toFixed(2)} TND</p>
                    <span className={`inline-block text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
              ⚠️ Stock Faible
            </h3>
            {lowStockProducts.length > 0 && (
              <span className="text-xs text-muted-foreground font-heading">
                {lowStockProducts.length} produits
              </span>
            )}
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tous les produits sont bien approvisionnés.</p>
            ) : (
              <>
                {paginatedLowStock.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image ? `${IMAGE_API_URL}/${encodeURIComponent(product.image)}` : "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg bg-secondary object-contain"
                      />
                      <div>
                        <p className="font-body font-semibold text-sm text-foreground">{product.name}</p>
                        <p className="text-muted-foreground text-xs">{product.brandName}</p>
                      </div>
                    </div>
                    <span className="text-primary font-heading font-bold text-sm">
                      {(product.variants ?? []).reduce((acc, v) => acc + v.stock, 0)} restants
                    </span>
                  </div>
                ))}

                {/* Pagination */}
                {lowStockTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() => setLowStockPage((p) => p - 1)}
                      disabled={lowStockPage === 0}
                      className="px-3 py-1.5 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Préc
                    </button>
                    {Array.from({ length: lowStockTotalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setLowStockPage(i)}
                        className={`w-7 h-7 rounded-lg font-heading text-xs font-bold transition-colors ${lowStockPage === i
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border border-border text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setLowStockPage((p) => p + 1)}
                      disabled={lowStockPage === lowStockTotalPages - 1}
                      className="px-3 py-1.5 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Suiv →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;