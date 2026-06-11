import { DollarSign, ShoppingCart, AlertTriangle, Clock } from "lucide-react";
import { DashboardSummaryDto } from "../../../models/DashboardDto";


interface Props { summary?: DashboardSummaryDto; }

const statCards = (summary?: DashboardSummaryDto) => [
  { label: "Revenu Semaine", icon: DollarSign, value: `${summary?.WeekTotalRevenue?.toFixed(2) ?? "—"} TND` },
  { label: "Commandes Semaine", icon: ShoppingCart, value: `${summary?.WeekTotalOrders ?? "—"}` },
  { label: "En Attente Aujourd'hui", icon: Clock, value: `${summary?.todayWaitingOrders ?? "—"}` },
  { label: "Stock Faible", icon: AlertTriangle, value: `${summary?.lowStockCount ?? "—"}` },
];

const SummaryCards: React.FC<Props> = ({ summary }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {statCards(summary).map((card) => (
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
);

export default SummaryCards;