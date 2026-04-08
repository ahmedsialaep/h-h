import { IMAGE_API_URL } from "@/config/config";
import { useAppSelector } from "@/store/hook";

interface OrderSummaryProps {
  deliveryFee: number;
}

const OrderSummary = ({ deliveryFee }: OrderSummaryProps) => {
  const cart = useAppSelector((state) => state.cart.cart);
  const items = cart?.cartItemDtos ?? [];
  const totalPrice = items.reduce((acc, i) => acc + i.quantity * (i.productPrice ?? 0), 0);
  const total = totalPrice + deliveryFee;

  return (
    <div className="bg-card border border-border rounded-lg p-5 h-fit sticky top-24">
      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">
        Récapitulatif
      </h3>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded flex-shrink-0 flex items-center justify-center">
              <img
                src={item.productImage
                  ? `${IMAGE_API_URL}/${encodeURIComponent(item.productImage)}`
                  : "/placeholder.png"}
                alt={item.productName}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-xs font-semibold truncate">{item.productName}</p>
              <p className="text-muted-foreground text-[10px]">
                {item.variantSize} • {item.variantColor} × {item.quantity}
              </p>
            </div>
            <span className="text-foreground text-xs font-bold">
              {((item.productPrice ?? 0) * item.quantity).toFixed(2)} TND
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="text-foreground font-semibold">{totalPrice.toFixed(2)} TND</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span className={deliveryFee === 0 ? "text-primary font-semibold" : "text-foreground font-semibold"}>
            {deliveryFee === 0 ? "GRATUIT" : `${deliveryFee} TND`}
          </span>
        </div>
        <div className="flex justify-between text-base pt-2 border-t border-border">
          <span className="text-foreground font-heading font-bold">Total</span>
          <span className="text-foreground font-heading font-black">{total.toFixed(2)} TND</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;