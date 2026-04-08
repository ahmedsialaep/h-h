import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

import ProductCard from "@/components/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProducts, setPage } from "@/store/productSlice";
import { Genre } from "@/models/Product";
import { GENDER_CONTENT, GENDER_SLUG_MAP } from "@/models/constants/GenderConstant";

const PAGE_SIZE = 16;

const GenderCollection = () => {
  const { gender } = useParams<{ gender: string }>();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const total = useAppSelector((state) => state.products.totalItems);
  const totalPages = useAppSelector((state) => state.products.totalPages);
  const page = useAppSelector((state) => state.products.filters.page ?? 0);

  const genre = gender ? GENDER_SLUG_MAP[gender.toLowerCase()] : undefined;
  const content = genre ? GENDER_CONTENT[genre] : undefined;
  useEffect(() => {
    dispatch(setPage(0));
  }, [genre]);

 useEffect(() => {
  if (!genre) return;
  dispatch(fetchProducts({
    filters: {
      page,
      pageSize: PAGE_SIZE,
      genres: [genre],
      sortBy: "id",
      sortDir: "asc",
      brandIds: null,
      categories: null,
      types: null,
      colors: null,
      size: null,
      minPrice: null,
      maxPrice: null,
      newArrival: null,
      marketVisible: [true],
      search: null
    },
    search: null,
  }));
}, [dispatch, genre, page]);

  if (!genre || !content) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Collection introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-card rounded-xl overflow-hidden mb-12 p-10 md:p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <p className="font-heading text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">
              {content.subtitle}
            </p>
            <h1 className="font-heading font-black text-4xl md:text-6xl text-foreground">
              {content.title}
            </h1>
            <p className="text-muted-foreground font-body mt-3 max-w-md">
              {content.description}
            </p>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-sm">{total} produits</p>
          <Link
            to={`/shop?genre=${genre}`}
            className="text-primary font-heading font-semibold text-sm uppercase tracking-wider hover:underline flex items-center gap-1"
          >
            Filtrer dans la Boutique <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">Aucun produit disponible.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => dispatch(setPage(page - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Préc
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => dispatch(setPage(i))}
                className={`w-9 h-9 rounded-lg font-heading text-xs font-bold transition-colors ${
                  page === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => dispatch(setPage(page + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Suiv →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenderCollection;