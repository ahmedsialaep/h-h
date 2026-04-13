import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag, Heart, ArrowLeft, Star, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProducts, fetchProductById, clearSelected } from "@/store/productSlice";
import { addItem, syncCart } from "@/store/CartSlice";
import { CartItemDto } from "@/models/CartItem";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import { IMAGE_API_URL } from "@/config/config";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");

  const product = useAppSelector((state) => state.products.selected);
  const related = useAppSelector((state) => state.products.items);
  const selectedStatus = useAppSelector((state) => state.products.selectedStatus);
  const cart = useAppSelector((state) => state.cart.cart);
  const guestItems = useAppSelector((state) => state.cart.guestItems); // ← add
  const user = useAppSelector((state) => state.auth.user);

  // ✅ single source of truth for active cart items
  const activeItems = user ? (cart?.cartItemDtos ?? []) : (guestItems ?? []);
  
  useEffect(() => {
    if (!id) return;
    dispatch(fetchProductById(Number(id)));
    return () => { dispatch(clearSelected()); };
  }, [dispatch, id]);

  useEffect(() => {
    setSelectedSize(null);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    dispatch(fetchProducts({
      filters: {
        page: 0,
        pageSize: 4,
        categories: [product.categorie],
        sortBy: "id",
        sortDir: "asc",
        brandIds: null,
        genres: null,
        types: null,
        colors: null,
        size: null,
        minPrice: null,
        maxPrice: null,
        newArrival: null,
        search: null,
      },
    }));
  }, [dispatch, product?.id]);

  // ✅ now accounts for items already in cart/guestItems
  const getVariantStock = (size: string) => {
    const variant = (product?.variants ?? []).find((v) => String(v.size) === size);
    if (!variant) return 0;
    return Math.max(0, (variant.availableQuantity ?? 0));
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !product) return;

    const variant = (product.variants ?? []).find((v) => String(v.size) === selectedSize);
    if (!variant) return;

    const item: CartItemDto = {
      id: null,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productRef: product.ref ?? "",
      productImage: product.image ?? null,
      brandName: product.brandName ?? null,
      variantId: variant.id,
      variantSize: selectedSize,
      variantColor: variant.color ?? "",
      availableQte: variant.availableQuantity,
      quantity: 1,
    };

    if (user) {
      // Build updatedItems BEFORE dispatch — avoids stale closure
      const currentItems = cart?.cartItemDtos ?? [];
      const existing = currentItems.find((i) => i.variantId === variant.id);
      const updatedItems = existing
        ? currentItems.map((i) =>
            i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...currentItems, item];

      dispatch(addItem(item));
      // ✅ strip null ids — backend assigns real IDs, null causes 403
      dispatch(syncCart(updatedItems.map(({ id, ...rest }) => ({ ...rest, id: id ?? undefined }))));
      dispatch(fetchProductById(Number(id)));
    } else {
      // Guest — stored locally by redux-persist
      dispatch(addItem(item));
    }
  };

  const tabLabels: Record<string, string> = {
    description: "Description",
    details: "Détails",
    shipping: "Livraison",
  };

  if (selectedStatus === "loading") {
    return <Loading fullScreen size="xl" text="Chargement du produit..." />;
  }

  if (selectedStatus === "failed" || (selectedStatus === "succeeded" && !product)) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 md:px-6">
          <EmptyState
            icon="file"
            title="Produit introuvable"
            description="Ce produit n'existe pas ou a été supprimé."
            action={{ label: "Retour à la boutique", href: "/shop" }}
          />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const totalStock = (product.variants ?? []).reduce((acc, v) => {
    const inCart = activeItems.find((i) => i.variantId === v.id)?.quantity ?? 0;
    return acc + Math.max(0, (v.availableQuantity ?? 0) - inCart);
  }, 0);

  const availableSizes = [...new Set(
    (product.variants ?? [])
      .map((v) => v.size)
      .filter((s): s is string => s !== undefined && s !== null)
  )];

  const availableColors = [...new Set(
    (product.variants ?? [])
      .map((v) => v.color)
      .filter((c): c is string => c !== undefined)
  )];

  const isSoldOut = (product.variants ?? []).every((v) => {
   
    return (v.availableQuantity ?? 0) <= 0;
  });

  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);
  const selectedVariantStock = selectedSize !== null ? getVariantStock(selectedSize) : 0;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-heading text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Retour à la Boutique
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl aspect-square flex items-center justify-center p-12"
          >
            <img
              src={product.image ? `${IMAGE_API_URL}/${encodeURIComponent(product.image)}` : "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-heading text-primary font-bold text-xs uppercase tracking-[0.3em]">
                {product.brandName}
              </span>
              {product.newArrival && (
                <span className="bg-primary text-primary-foreground font-heading font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                  Nouveau
                </span>
              )}
            </div>

            <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-primary fill-primary" />
                <span className="font-body font-semibold text-sm text-foreground">
                  {product.averageRating ?? "—"}
                </span>
              </div>
              <span className="font-heading font-black text-2xl text-foreground">
                {product.price} TND
              </span>
            </div>

            {totalStock <= 5 && totalStock > 0 && (
              <div className="flex items-center gap-2 text-primary mb-4">
                <AlertTriangle size={14} />
                <span className="font-body text-sm font-semibold">
                  Plus que {totalStock} en stock !
                </span>
              </div>
            )}

            {/* Sizes */}
            <div className="mb-6">
              <p className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-3">
                Choisir la Taille
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const stock = getVariantStock(size);
                  const outOfStock = stock === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`min-w-[3rem] h-12 px-3 rounded-lg font-heading font-bold text-sm border transition-all ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary"
                          : outOfStock
                            ? "bg-card border-border text-muted-foreground/30 cursor-not-allowed line-through"
                            : "bg-card border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-8">
              <p className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-3">
                Couleurs
              </p>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((color) => (
                  <span
                    key={color}
                    className="px-3 py-1.5 bg-card border border-border rounded-full text-muted-foreground text-xs font-body"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut || !selectedSize || selectedVariantStock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider py-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-orange"
              >
                <ShoppingBag size={18} />
                {isSoldOut
                  ? "Épuisé"
                  : !selectedSize
                    ? "Choisir une Taille"
                    : selectedVariantStock === 0
                      ? "Rupture de Stock"
                      : "Ajouter au Panier"}
              </button>
              <button className="w-14 h-14 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-10 border-t border-border pt-6">
              <div className="flex gap-6 mb-4">
                {["description", "details", "shipping"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-heading font-semibold text-sm uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                      activeTab === tab
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    {tabLabels[tab]}
                  </button>
                ))}
              </div>
              <div className="text-muted-foreground text-sm font-body leading-relaxed">
                {activeTab === "description" && (
                  <p>{product.description ?? "Aucune description disponible."}</p>
                )}
                {activeTab === "details" && (
                  <ul className="space-y-1.5">
                    <li>• Marque : {product.brandName}</li>
                    <li>• Catégorie : {product.categorie}</li>
                    <li>• Tailles disponibles : {availableSizes.join(", ")}</li>
                    <li>• Couleurs : {availableColors.join(", ")}</li>
                  </ul>
                )}
                {activeTab === "shipping" && (
                  <div className="space-y-2">
                    <p>🏪 <strong className="text-foreground">Retrait Gratuit en Magasin</strong> — Prêt sous 24 heures</p>
                    <p>🚚 <strong className="text-foreground">Livraison Standard</strong> — 2–5 jours ouvrables</p>
                    <p>⚡ <strong className="text-foreground">Livraison Express</strong> — 1–2 jours ouvrables</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-heading font-black text-2xl text-foreground mb-8">VOUS AIMEREZ AUSSI</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;