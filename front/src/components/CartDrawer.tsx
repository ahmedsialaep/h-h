import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { removeItem, updateQuantity, syncCart, closeCart } from "@/store/CartSlice";
import { IMAGE_API_URL } from "@/config/config";
import { useToast } from "@/hooks/use-toast";

const CartDrawer = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const guestItems = useAppSelector((state) => state.cart.guestItems);
  const user = useAppSelector((state) => state.auth.user);
  const isOpen = useAppSelector((state) => state.cart.isCartOpen);
  const { toast } = useToast();

  // Single source of truth — no products store needed anymore
  const items = user ? (cart?.cartItemDtos ?? []) : (guestItems ?? []);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = items.reduce((acc, i) => acc + i.quantity * (i.productPrice ?? 0), 0);

  const handleClose = () => dispatch(closeCart());

  const handleUpdateQuantity = (variantId: number, quantity: number) => {
    const item = items.find((i) => i.variantId === variantId);
    if (!item) return;

    // ✅ REMOVE
    if (quantity <= 0) {
      dispatch(removeItem(variantId));

      if (user && cart) {
        const updatedItems = cart.cartItemDtos.filter((i) => i.variantId !== variantId);
        dispatch(syncCart(updatedItems));
      }
      return;
    }

    const baseStock = item.availableQte ?? 0;
    const currentQty = item.quantity;
    const nextQty = quantity;

    const remaining = baseStock - currentQty;
    const isIncrementing = nextQty > currentQty;

    if (isIncrementing && remaining <= 0) {
      toast({
        title: "Stock insuffisant",
        description: `Stock max atteint (${baseStock})`,
        variant: "destructive",
      });
      return;
    }

    dispatch(updateQuantity({ variantId, quantity }));

    if (user && cart) {
      const updatedItems = cart.cartItemDtos.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      );

      dispatch(
        syncCart(
          updatedItems.map(({ id, ...rest }) => ({
            ...rest,
            id: id ?? undefined,
          }))
        )
      );
    }
  };

  const handleRemoveItem = (variantId: number) => {
    dispatch(removeItem(variantId));
    if (user && cart) {
      const updatedItems = cart.cartItemDtos.filter((i) => i.variantId !== variantId);
      dispatch(syncCart(updatedItems));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-secondary border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-foreground">
                Panier ({totalItems})
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-body">Votre panier est vide</p>
                  <button
                    onClick={handleClose}
                    className="mt-4 text-primary font-heading font-semibold text-sm uppercase tracking-wider hover:underline"
                  >
                    Continuer vos achats
                  </button>
                </div>
              ) : (
                items.map((item) => {
                

                  return (
                    <div key={item.variantId} className="flex gap-4 bg-card rounded-lg p-3">
                      <div className="w-20 h-20 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                        <img
                          src={
                            item.productImage
                              ? `${IMAGE_API_URL}/${encodeURIComponent(item.productImage)}`
                              : "/placeholder.png"
                          }
                          alt={item.productName}
                          className="w-16 h-16 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-body font-semibold text-sm truncate">
                          {item.productName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.variantSize} • {item.variantColor}
                        </p>
                      
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.variantId, item.quantity - 1)
                              }
                              className="w-6 h-6 flex items-center justify-center bg-muted rounded text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-foreground text-sm font-semibold w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.variantId, item.quantity + 1)
                              }
                              
                              className="w-6 h-6 flex items-center justify-center bg-muted rounded text-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-heading font-bold text-sm text-foreground">
                            {((item.productPrice ?? 0) * item.quantity).toFixed(2)} TND
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.variantId)}
                        className="text-muted-foreground hover:text-destructive transition-colors self-start"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-body">Sous-total</span>
                  <span className="font-heading font-bold text-lg text-foreground">
                    {totalPrice.toFixed(2)} TND
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={handleClose}
                  className="block w-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider py-3.5 rounded-lg text-center hover:brightness-110 transition-all"
                >
                  Passer la Commande
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;