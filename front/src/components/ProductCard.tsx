import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { ProductDTO } from "@/models/Product";
import { IMAGE_API_URL } from "@/config/config";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { CartItemDto } from "@/models/CartItem";
import { addItem, syncCart } from "@/store/CartSlice";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { ProductVariantDTO } from "../models/ProductVars";
import { fetchVariantStock } from "../store/productSlice";

interface ProductCardProps {
  product: ProductDTO;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const guestItems = useAppSelector((state) => state.cart.guestItems);
  const variantStock = useAppSelector((state) => state.products.variantStock);
  const user = useAppSelector((state) => state.auth.user);
  const { toast } = useToast();

  const getAvailableStock = (variant: ProductVariantDTO) => {
    if (user) {
      // Logged-in: use server-computed availableQte from cart item
      const item = cart?.cartItemDtos?.find((i) => i.variantId === variant.id);
      return item?.availableQte ?? variant.availableQuantity ?? 0;
    } else {

      const fresh = variantStock;
      const rawStock = fresh?.availableQuantity ?? variant.availableQuantity ?? 0;
      const inGuestCart = guestItems.find((i) => i.variantId === variant.id)?.quantity ?? 0;
      return Math.max(0, rawStock - inGuestCart);
    }
  };

  const isSoldOut =
    !product.variants?.length ||
    product.variants.every((v) => getAvailableStock(v) <= 0);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variant = product.variants[Math.floor(product.variants.length / 2)];

    if (!user) {
      await dispatch(fetchVariantStock(variant.id));
    }

    const available = getAvailableStock(variant);

    if (available <= 0) {
      toast({
        title: "Stock insuffisant",
        description: `Plus de stock pour la taille ${variant.size}`,
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
      availableQte: variant.availableQuantity, // stored at add-time
      quantity: 1,
    };

    const items = user ? (cart?.cartItemDtos ?? []) : (guestItems ?? []);
    const existing = items.find((i) => i.variantId === variant.id);
    const updatedItems = existing
      ? items.map((i) =>
        i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
      )
      : [...items, item];

    dispatch(addItem(item));

    if (user) {
      dispatch(
        syncCart(
          updatedItems.map(({ id, ...rest }) => ({ ...rest, id: id ?? undefined }))
        )
      );
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
            <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground font-heading font-bold text-[10px] uppercase px-2 py-1">
              Nouveau
            </span>
          )}

          {product.originalPrice && (
            <span className="absolute top-3 right-3 z-10 bg-destructive text-white font-bold text-[10px] px-2 py-1">
              Promo
            </span>
          )}

          <div className="w-full h-full flex items-center justify-center p-8 group-hover:scale-110 transition-transform">
            <img
              src={
                product.image
                  ? `${IMAGE_API_URL}/${product.image}`
                  : "/placeholder.png"
              }
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          {!isSoldOut ? (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-0 left-0 right-0 bg-primary text-white font-bold text-sm py-3 translate-y-full group-hover:translate-y-0 transition"
            >
              <ShoppingBag size={16} className="inline mr-2" />
              Ajout Rapide
            </button>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 bg-muted text-muted-foreground font-bold text-sm py-3 text-center">
              Épuisé
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-muted-foreground text-xs uppercase">
            {product.brandName}
          </p>
          <h3 className="text-foreground font-semibold text-sm">
            {product.name}
          </h3>
          <span className="font-bold text-foreground">
            {product.price} TND
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;