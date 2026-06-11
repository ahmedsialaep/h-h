import { STATUS_COLORS, STATUS_LABELS } from "@/models/constants/StatusConstants";

interface Props { orders: any[]; }

const RecentOrders: React.FC<Props> = ({ orders }) => (
  <div className="bg-card border border-border rounded-xl p-6">
    <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Commandes Récentes</h3>
    <div className="space-y-3">
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aucune commande récente.</p>
      ) : (
        orders.map((order) => (
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
);

export default RecentOrders;