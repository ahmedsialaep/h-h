import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CategorieSales } from "../../../models/DashboardDto";

interface Props { categoryStats: CategorieSales[]; }

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#6366f1", "#f59e0b", "#94a3b8"];

const CategoryBarChart: React.FC<Props> = ({ categoryStats }) => (
  <div className="bg-card border border-border rounded-xl p-6">
    <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Ventes par Catégorie</h3>
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={categoryStats}
          cx="50%" cy="50%"
          innerRadius={60} outerRadius={90}
          paddingAngle={4} dataKey="value"
          nameKey="categorieName"
          label={({ CategorieName, rate }) => `${CategorieName} ${rate}%`}
          fontSize={11}
        >
          {categoryStats.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default CategoryBarChart;