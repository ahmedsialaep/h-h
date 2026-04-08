import { useEffect, useState } from "react";
import { MapPin, Search, Truck, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { Status, DeliveryMethod, CommandeDto } from "@/models/Commande";
import { fetchCommandes, setFilters, setPage, updateCommandeStatus } from "@/store/CommandeSlice";
import { IMAGE_API_URL } from "@/config/config";
import { ALL_STATUSES, STATUS_COLORS, STATUS_LABELS } from "@/models/constants/StatusConstants";
import EnhancedSelect from "@/components/admin/EnhancedSelect";

const AdminOrders = () => {
  const dispatch = useAppDispatch();
  const { items: orders, currentPage, totalPages, filters } = useAppSelector(state => state.commande);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [search, setSearch] = useState("");

  const handleStatusChange = (id: number, status: Status) => {
    dispatch(updateCommandeStatus({ id, status }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  useEffect(() => {
    
    dispatch(fetchCommandes(filters));
  }, [dispatch, filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    
    dispatch(setFilters({ search: val.trim() || null, page: 0 }));
  };

  const toggleStatus = (s: Status) => {
    const updated = selectedStatuses.includes(s)
      ? selectedStatuses.filter((x) => x !== s)
      : [...selectedStatuses, s];
    setSelectedStatuses(updated);
    console.log(">>> DISPATCHING STATUSES:", updated);
    dispatch(setFilters({ statuses: updated.length ? updated : null, page: 0 }));
  };

  const clearSearch = () => {
    setSearch("");
    dispatch(setFilters({ search: null, page: 0 }));
  };



  const clearFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
    dispatch(setFilters({ search: null, statuses: null, page: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">Commandes</h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} commandes au total</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher par N° commande, nom ou email..."
          value={search}
          onChange={handleSearch}
          className="w-full bg-card border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">Statut:</span>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => toggleStatus(s)}
            className={`text-xs font-heading uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${selectedStatuses.includes(s)
                ? STATUS_COLORS[s]
                : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        {(search || selectedStatuses.length > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
          >
            <X size={12} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {orders.map((order: CommandeDto) => (
          <div key={order.id} className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-heading font-bold text-foreground">{order.ref}</h3>
                  <span className={`inline-block text-[10px] font-heading uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    {order.deliveryMethod === DeliveryMethod.PICKUP
                      ? <><MapPin size={12} /> Retrait</>
                      : <><Truck size={12} /> Livraison</>}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  {order.userNom || order.guestFirstName} {order.userPrenom || order.guestLastName}
                  {" • "}
                  {order.username || order.guestEmail}
                  {" • "}
                  {new Date(order.createdAt).toLocaleString("fr-TN")}
                </p>
                {order.adress && (
                  <p className="text-muted-foreground text-xs mt-1">
                    📍 {order.adress}{order.city ? `, ${order.city}` : ""}
                  </p>
                )}
              </div>

              <EnhancedSelect
                label=""
                value={order.status}
                options={ALL_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
                onChange={(val) => handleStatusChange(order.id, val as Status)}
                className="w-48"
              />
            </div>

            {/* Items */}
            <div className="border-t border-border pt-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.productImage && (
                    <img
                      src={`${IMAGE_API_URL}/${encodeURIComponent(item.productImage)}`}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg bg-secondary object-contain flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">{item.productName}</span>
                      <span className="text-xs ml-1">
                        ({item.variantSize} • {item.variantColor}) × {item.quantity}
                      </span>
                    </span>
                    <span className="font-heading font-bold text-foreground">
                      {(item.unitPrice * item.quantity).toFixed(2)} TND
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-3 border-t border-border">
                {order.deliveryFee > 0 && (
                  <span className="text-muted-foreground text-xs">
                    Livraison: {order.deliveryFee.toFixed(2)} TND
                  </span>
                )}
                <span className="font-heading font-black text-lg text-foreground ml-auto">
                  {order.totalPrice.toFixed(2)} TND
                </span>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">Aucune commande trouvée.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Préc
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx)}
              className={`w-9 h-9 rounded-lg font-heading text-xs font-bold transition-colors ${idx === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Suiv →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;