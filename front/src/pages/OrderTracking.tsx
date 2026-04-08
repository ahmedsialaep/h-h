import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Package, PackageCheck, Truck, MapPin, Search, ArrowLeft, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchOrderByRef } from "@/store/CommandeSlice";
import { Status, DeliveryMethod } from "@/models/Commande";
import { IMAGE_API_URL } from "@/config/config";
import { STATUS_COLORS, STATUS_LABELS } from "@/models/constants/StatusConstants";
import Loading from "@/components/Loading";

const DELIVERY_STEPS = [
  {
    key: Status.EN_ATTENTE,
    label: "Commande reçue",
    description: "Votre commande a été reçue et est en attente de confirmation.",
    icon: Package,
  },
  {
    key: Status.CONFIRMEE,
    label: "Commande confirmée",
    description: "Votre commande a été confirmée et est en cours de préparation.",
    icon: CheckCircle,
  },
  {
    key: Status.EXPEDIEE,
    label: "Expédiée",
    description: "Votre commande est en route vers vous.",
    icon: Truck,
  },
  {
    key: Status.LIVREE,
    label: "Livrée",
    description: "Votre commande a été livrée avec succès.",
    icon: PackageCheck,
  },
];

const PICKUP_STEPS = [
  {
    key: Status.EN_ATTENTE,
    label: "Commande reçue",
    description: "Votre commande a été reçue et est en attente de confirmation.",
    icon: Package,
  },
  {
    key: Status.CONFIRMEE,
    label: "Commande confirmée",
    description: "Votre commande a été confirmée et est en cours de préparation.",
    icon: CheckCircle,
  },
  {
    key: Status.PRETE_RETRAIT,
    label: "Prête au retrait",
    description: "Votre commande est prête. Vous pouvez venir la récupérer en magasin.",
    icon: MapPin,
  },
  {
    key: Status.RECUPEREE,
    label: "Récupérée",
    description: "Votre commande a été récupérée avec succès.",
    icon: PackageCheck,
  },
];

const OrderTracking = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAppSelector((state) => state.auth.user);
  const { selectedOrder: order, selectedOrderStatus } = useAppSelector((state) => state.commande);

  const [inputRef, setInputRef] = useState(searchParams.get("ref") ?? "");
  const [searchedRef, setSearchedRef] = useState(searchParams.get("ref") ?? "");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
  }, [user, navigate]);

  
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setInputRef(ref);
      setSearchedRef(ref);
      dispatch(fetchOrderByRef(ref));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = inputRef.trim().toUpperCase();
    if (!ref) return;
    setSearchedRef(ref);
    setSearchParams({ ref });
    dispatch(fetchOrderByRef(ref));
  };

  const isPickup = order?.deliveryMethod === DeliveryMethod.PICKUP;
  const steps = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;
  const isCancelled = order?.status === Status.ANNULEE;
  const currentStepIndex = isCancelled || !order
    ? -1
    : steps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Back */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-heading text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Mes Commandes
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
          Suivi de Commande
        </h1>
        <p className="text-muted-foreground mb-8">
          Entrez votre numéro de commande pour suivre son avancement.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ex: CMD-A1B2C3D4"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value.toUpperCase())}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-heading tracking-wider text-sm uppercase placeholder:text-muted-foreground placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
            {inputRef && (
              <button
                type="button"
                onClick={() => setInputRef("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider px-5 py-3 rounded-lg hover:brightness-110 transition-all shrink-0"
          >
            <Search size={16} /> Rechercher
          </button>
        </form>

        {/* Loading */}
        {selectedOrderStatus === "loading" && (
          <Loading size="lg" text="Chargement du suivi..." />
        )}

        {/* Not found */}
        {selectedOrderStatus === "failed" && searchedRef && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
            <p className="font-heading font-bold text-foreground mb-1">Commande introuvable</p>
            <p className="text-sm text-muted-foreground">
              Aucune commande trouvée avec le numéro{" "}
              <span className="font-semibold text-foreground">{searchedRef}</span>.
            </p>
          </div>
        )}

        {/* Order found */}
        {selectedOrderStatus === "succeeded" && order && (
          <div className="space-y-6">

            {/* Summary */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-heading font-bold text-lg text-foreground">{order.ref}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {isPickup
                      ? <><MapPin size={12} /> Retrait</>
                      : <><Truck size={12} /> Livraison</>}
                  </span>
                  <span className={`text-[10px] font-heading uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground">Articles</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
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

              {/* Delivery info */}
              <div className="border-t border-border pt-4 space-y-1">
                {isPickup ? (
                  <p className="text-sm text-foreground flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary" /> Retrait en magasin
                  </p>
                ) : (
                  order.adress && (
                    <p className="text-sm text-foreground">
                      📍 {order.adress}{order.city ? `, ${order.city}` : ""}
                    </p>
                  )
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
            </div>

            {/* Timeline */}
            {isCancelled ? (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 text-center">
                <p className="font-heading font-bold text-destructive">Commande Annulée</p>
                <p className="text-sm text-muted-foreground mt-1">Cette commande a été annulée.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="font-heading font-bold text-foreground mb-6">Suivi en temps réel</p>
                <div className="relative">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {index < steps.length - 1 && (
                          <div
                            className={`absolute left-5 top-10 w-0.5 h-[calc(100%-8px)] transition-colors ${
                              index < currentStepIndex ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className={index === steps.length - 1 ? "pb-0" : "pb-8"}>
                          <p className={`font-heading font-bold text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          {isCurrent && order.updatedAt && (
                            <p className="text-xs text-primary font-semibold mt-1">
                              {new Date(order.updatedAt).toLocaleDateString("fr-FR", {
                                day: "numeric", month: "long", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;