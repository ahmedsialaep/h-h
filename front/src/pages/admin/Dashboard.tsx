import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { fetchCommandes } from "@/store/CommandeSlice";
import { fetchDashboard } from "@/store/statsSlice";
import MonthlyStatsCharts from "./Dashboard/MonthlyStats";
import SummaryCards from "./Dashboard/DashboardSummaryCard";
import CategoryBarChart from "./Dashboard/CategorieBarChart";
import RecentOrders from "./Dashboard/RecentOrders";
import LowStockList from "./Dashboard/LowStockList";


const Dashboard = () => {
  const dispatch = useAppDispatch();
  const currentYear = new Date().getFullYear();

  const { items: orders } = useAppSelector((state) => state.commande);
  const products = useAppSelector((state) => state.products.items);
  const { dashboard } = useAppSelector((state) => state.stats);

  useEffect(() => {
    dispatch(fetchDashboard(currentYear));

    dispatch(fetchCommandes({ page: 0, pageSize: 5, userId: null, search: null, status: null }));
  }, [dispatch]);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const lowStockProducts = products.filter((p) => (p.totalAvailableQte ?? 0) <= 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">Tableau de Bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <SummaryCards summary={dashboard?.summary} />
      <MonthlyStatsCharts monthlyStats={dashboard?.monthlyStats ?? []} />

      <div className="grid md:grid-cols-2 gap-6">
        <CategoryBarChart categoryStats={dashboard?.categoryStats ?? []} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <RecentOrders orders={recentOrders} />
        <LowStockList products={lowStockProducts} />
      </div>
      
    </div>
  );
};

export default Dashboard;