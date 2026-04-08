import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { ProductDTO } from "@/models/Product";
import { IMAGE_API_URL } from "@/config/config";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { CartItemDto } from "@/models/CartItem";
import { addItem, fetchCart, syncCart } from "@/store/CartSlice";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: ProductDTO;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const user = useAppSelector((state) => state.auth.user);
  const { toast } = useToast();

  const getAvailableStock = (variantId: number, availableQuantity: number) => {
  
  const inCart = cart?.cartItemDtos?.find((i) => i.variantId === variantId)?.quantity ?? 0;
  return (availableQuantity ?? 0) - inCart;
};

const isSoldOut =
  !product.variants ||
  product.variants.length === 0 ||
  product.variants.every((v) => getAvailableStock(v.id, v.availableQuantity ?? 0) <= 0);

const handleQuickAdd = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (isSoldOut) return;

  
  const variant = product.variants[Math.floor(product.variants.length / 2)];

  const available = getAvailableStock(variant.id, variant.availableQuantity ?? 0);

  if (available <= 0) {
    toast({
      title: "Stock insuffisant",
      description: `Il n'y a plus de stock disponible pour ce produit.`,
      variant: "destructive",
    });
    return;
  }

  const item: CartItemDto = {
    id: null,
    productId: product.id,
    productName: product.name,
    productPrice: product.price,
    productRef: product.ref ?? "",
    productImage: product.image ?? null,
    brandName: product.brandName ?? null,
    variantId: variant.id,
    variantSize: String(variant.size ?? ""),
    variantColor: variant.color ?? "",
    quantity: 1,
  };

  
  if (user && !cart) {
    await dispatch(fetchCart());
  }

  // Add item to Redux state
  dispatch(addItem(item));

  if (user) {
    const currentItems = cart?.cartItemDtos ?? [];
    const existing = currentItems.find((i) => i.variantId === variant.id);

    const updatedItems = existing
      ? currentItems.map((i) =>
          i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...currentItems, item];

    
    dispatch(syncCart(updatedItems));
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative bg-card rounded-lg overflow-hidden aspect-square">

          {product.newArrival && (
            <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground font-heading font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
              Nouveau
            </span>
          )}

          {product.originalPrice && (
            <span className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground font-heading font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
              Promo
            </span>
          )}

          <div className="w-full h-full flex items-center justify-center p-8 transition-transform duration-500 group-hover:scale-110">
            <img
              src={product.image ? `${IMAGE_API_URL}/${product.image}` : "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl"
              loading="lazy"
            />
          </div>

          {!isSoldOut ? (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Ajout Rapide
            </button>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 bg-muted text-muted-foreground font-heading font-bold text-sm uppercase tracking-wider py-3 flex items-center justify-center gap-2 border-t border-border">
              <span>Épuisé</span>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-muted-foreground text-xs font-heading uppercase tracking-wider">
            {product.brandName}
          </p>
          <h3 className="text-foreground font-body font-semibold text-sm">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-foreground font-heading font-bold">
              {product.price} TND
            </span>
            {product.originalPrice && (
              <span className="text-muted-foreground line-through text-xs">
                {product.originalPrice} TND
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;