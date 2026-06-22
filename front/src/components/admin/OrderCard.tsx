// OrderCard.tsx
import { useEffect, useState } from "react";
import { MapPin, Truck, ChevronDown, X } from "lucide-react";
import { Status, DeliveryMethod, CommandeDto } from "@/models/Commande";
import {
    STATUS_LABELS,
    STATUS_COLORS,
    STATUS_BY_DELIVERY_METHOD,
    allowedStatusTransitions,
} from "@/models/constants/StatusConstants";
import EnhancedSelect from "@/components/admin/EnhancedSelect";
import { IMAGE_API_URL } from "@/config/config";
import { fetchCommandeItems } from "@/store/CommandeSlice";
import { useAppDispatch, useAppSelector } from "@/store/hook";

interface OrderCardProps {
    order: CommandeDto;
    onStatusChange: (id: number, status: Status) => void;
    pendingCancel: boolean;
    commentaire: string;
    onCommentaireChange: (value: string) => void;
    onConfirmCancel: () => void;
    onCancelCancel: () => void;
}

const OrderCard = ({
    order,
    onStatusChange,
    pendingCancel,
    commentaire,
    onCommentaireChange,
    onConfirmCancel,
    onCancelCancel,
}: OrderCardProps) => {

    const isStatusEnabled = (current: Status, target: Status) => {
        return allowedStatusTransitions[current]?.includes(target);
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const [itemsFetched, setItemsFetched] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const dispatch = useAppDispatch();

    const items = useAppSelector(state => state.commande.OrderItems?.[order.ref]) ?? [];


    useEffect(() => {
        if (isExpanded && !itemsFetched) {
            setIsLoadingItems(true);
            dispatch(fetchCommandeItems(order.ref))
                .finally(() => {
                    setIsLoadingItems(false);
                    setItemsFetched(true);
                });
        }

    }, [isExpanded]);


    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
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
                        {new Date(order.createdAt).toLocaleString("fr-TN", {
                            hour12: false,
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                    {order.adress && (
                        <p className="text-muted-foreground text-xs mt-1">
                            📍 {order.adress}{order.city ? `, ${order.city}` : ""}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <EnhancedSelect
                        label=""
                        value={order.status}
                        options={STATUS_BY_DELIVERY_METHOD[order.deliveryMethod].map((s) => ({
                            value: s,
                            label: STATUS_LABELS[s],
                            disabled: !isStatusEnabled(order.status, s),
                        }))}
                        onChange={(val) => onStatusChange(order.id, val as Status)}
                        className="w-48"
                    />
                    <button
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={isExpanded ? "Masquer les articles" : "Voir les articles"}
                    >
                        <span className="font-heading uppercase tracking-wider">Articles</span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
            </div>

            {/* Cancel comment input */}
            {pendingCancel && (
                <div className="flex items-center gap-2 w-full mt-3">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Commentaire (optionnel)..."
                        value={commentaire}
                        onChange={(e) => onCommentaireChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onConfirmCancel()}
                        className="flex-1 min-w-0 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    />
                    <button
                        onClick={onConfirmCancel}
                        className="shrink-0 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-heading uppercase tracking-wider hover:bg-primary/90 transition-colors"
                    >
                        Confirmer
                    </button>
                    <button
                        onClick={onCancelCancel}
                        className="shrink-0 p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Items */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[1000px] opacity-100 mt-4 pt-4 border-t border-border" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="space-y-3">
                    {isLoadingItems && !itemsFetched ? (
                        <div className="flex justify-center py-4">
                            <span className="text-xs text-muted-foreground font-heading uppercase tracking-wider animate-pulse">
                                Chargement...
                            </span>
                        </div>
                    ) : (
                        items.map((item, i) => (
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
                        ))
                    )}

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
        </div>
    );
};

export default OrderCard;