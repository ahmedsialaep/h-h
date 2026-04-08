import { useEffect, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { Package, Clock, CheckCircle, Truck, MapPin, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchMyOrders } from "@/store/CommandeSlice";
import { CommandeDto, DeliveryMethod, Status } from "@/models/Commande";
import { IMAGE_API_URL } from "@/config/config";
import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import { STATUS_COLORS, STATUS_LABELS } from "@/models/constants/StatusConstants";



const Orders = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { myOrders, myOrdersStatus } = useAppSelector((state) => state.commande);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    dispatch(fetchMyOrders());
  }, [dispatch, user, navigate]);

  if (myOrdersStatus === "loading") {
    return <Loading fullScreen size="lg" text="Chargement de vos commandes..." />;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground mb-8">
          Mes Commandes
        </h1>

        {myOrders.length === 0 ? (
          <EmptyState
            icon="package"
            title="Aucune commande"
            description="Vous n'avez pas encore passé de commande."
            action={{ label: "Voir la boutique", href: "/shop" }}
          />
        ) : (
          <div className="space-y-4">
            {myOrders.map((order: CommandeDto) => {
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-md">

                  {/* ← Order header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-foreground">{order.ref}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                        {order.deliveryMethod === DeliveryMethod.PICKUP
                          ? <><MapPin size={12} /> Retrait</>
                          : <><Truck size={12} /> Livraison</>}
                      </span>
                      <span className={`text-[10px] font-heading uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="font-heading font-bold text-foreground">
                        {order.totalPrice.toFixed(2)} TND
                      </span>
                      <Eye size={16} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* ← Expanded items */}
                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 bg-muted/30 space-y-4">

                      {/* Items */}
                      <div>
                        <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-3">Articles</p>
                        <div className="space-y-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-card rounded-lg flex-shrink-0 flex items-center justify-center">
                                <img
                                  src={item.productImage
                                    ? `${IMAGE_API_URL}/${encodeURIComponent(item.productImage)}`
                                    : "/placeholder.png"}
                                  alt={item.productName}
                                  className="w-8 h-8 object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.variantSize} • {item.variantColor} × {item.quantity}
                                </p>
                              </div>
                              <span className="font-heading font-bold text-sm text-foreground">
                                {(item.unitPrice * item.quantity).toFixed(2)} TND
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery info */}
                      <div className="border-t border-border pt-3 space-y-1">
                        <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">Livraison</p>
                        {order.deliveryMethod === DeliveryMethod.PICKUP ? (
                          <p className="text-sm text-foreground flex items-center gap-1.5">
                            <MapPin size={13} className="text-primary" /> Retrait en magasin
                          </p>
                        ) : (
                          <>
                            {order.adress && <p className="text-sm text-foreground">📍 {order.adress}{order.city ? `, ${order.city}` : ""}</p>}
                          </>
                        )}
                        {order.phone && <p className="text-sm text-muted-foreground">📞 {order.phone}</p>}
                        {order.notes && <p className="text-sm text-muted-foreground italic">"{order.notes}"</p>}
                      </div>

                      {/* Total */}
                      <div className="border-t border-border pt-3 flex justify-between items-center">
                        {order.deliveryFee > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Livraison: {order.deliveryFee.toFixed(2)} TND
                          </span>
                        )}
                        <span className="font-heading font-black text-lg text-foreground ml-auto">
                          Total: {order.totalPrice.toFixed(2)} TND
                        </span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border">
                        <Link
                          to={`/order-tracking?ref=${order.ref}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-primary hover:underline transition-colors"
                        >
                          <MapPin size={13} /> Suivre ma commande
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;