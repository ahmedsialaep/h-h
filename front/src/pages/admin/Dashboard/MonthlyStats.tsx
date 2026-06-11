import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, Legend,
} from "recharts";
import { MonthlyStats } from "../../../models/DashboardDto";

interface Props { monthlyStats: MonthlyStats[]; }

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
};

const MonthlyStatsCharts: React.FC<Props> = ({ monthlyStats }) => {
  const totalYearlyProfit = monthlyStats.reduce((s, m) => s + m.profit, 0);
  const currentMonthIndex = new Date().getMonth(); // 0 = Jan
  const currentMonth = monthlyStats[currentMonthIndex];
  const prevMonth = monthlyStats[currentMonthIndex - 1];

  return (
    <div className="space-y-6">
      {/* Revenue & Profit Line Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
              Revenu & Profit Annuel
            </h3>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground text-xs">
                Profit total: <span className="text-primary font-bold">{totalYearlyProfit.toFixed(2)} TND</span>
              </p>
              {currentMonth && (
                <div className={`flex items-center gap-1 text-xs font-heading font-bold ${currentMonth.profitRate >= 0 ? "text-green-500" : "text-destructive"}`}>
                  {currentMonth.profitRate >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {currentMonth.profitRate >= 0 ? "+" : ""}{currentMonth.profitRate}%
                </div>
              )}
            </div>
          </div>
          {currentMonth && (
            <div className="relative group">
              <div className={`flex items-center gap-1 cursor-help ${currentMonth.revenueRate >= 0 ? "text-green-500" : "text-destructive"}`}>
                {currentMonth.revenueRate >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-xs font-heading font-bold">
                  {currentMonth.revenueRate >= 0 ? "+" : ""}{currentMonth.revenueRate}%
                </span>
              </div>
              <div className="absolute right-0 top-6 z-10 hidden group-hover:block w-52 bg-card border border-border rounded-lg p-2.5 shadow-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Évolution du revenu de <span className="text-foreground font-semibold">{prevMonth?.month ?? "—"}</span> à <span className="text-foreground font-semibold">{currentMonth.month}</span>
                </p>
              </div>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} name="Revenu (TND)" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" name="Profit (TND)" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Commandes par Mois</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Commandes" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Area Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Évolution du Profit</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyStats}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={1} fill="url(#profitGrad)" strokeWidth={2} name="Profit (TND)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyStatsCharts;