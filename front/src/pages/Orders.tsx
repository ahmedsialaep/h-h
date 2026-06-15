import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, MapPin, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchMyOrders, setMyOrdersPage, setPage } from "@/store/CommandeSlice";
import { CommandeDto, DeliveryMethod, Status } from "@/models/Commande";
import { IMAGE_API_URL } from "@/config/config";
import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import { STATUS_COLORS, STATUS_LABELS } from "@/models/constants/StatusConstants";
import PageSkeleton from "../components/PageSkeleton";
import MyOrderCard from "../components/MyOrderCard";



const Orders = () => {
  const dispatch = useAppDispatch();
  const { myOrders: orders, myOrdersTotalPages, myOrdersFilters, myOrdersStatus } = useAppSelector(state => state.commande);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const myOrdersCurrentPage = myOrdersFilters.page ?? 0;
  
  useEffect(() => {
    dispatch(fetchMyOrders(myOrdersFilters));
  }, [dispatch, myOrdersFilters]);

  const handlePageChange = (page: number) => {
    dispatch(setMyOrdersPage(page));
  };

  if (myOrdersStatus === "loading") {
    return <PageSkeleton variant="orders" />;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground mb-8">
          Mes Commandes
        </h1>

        {orders.length === 0 ? (
          <EmptyState
            icon="package"
            title="Aucune commande"
            description="Vous n'avez pas encore passé de commande."
            action={{ label: "Voir la boutique", href: "/shop" }}
          />
        ) : (
          <>
            {orders.map((order: CommandeDto) => (
              <MyOrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrder === order.id}
                onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              />
            ))}

            {/* Pagination */}
            {myOrdersTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(myOrdersCurrentPage - 1)}
                  disabled={myOrdersCurrentPage === 0}
                  className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Préc
                </button>
                {Array.from({ length: myOrdersTotalPages }, (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx)}
                    className={`w-9 h-9 rounded-lg font-heading text-xs font-bold transition-colors ${idx === myOrdersCurrentPage
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(myOrdersCurrentPage + 1)}
                  disabled={myOrdersCurrentPage === myOrdersTotalPages - 1}
                  className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Suiv →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Orders;