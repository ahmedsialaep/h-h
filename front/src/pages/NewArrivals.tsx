import { useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProducts, setPage } from "@/store/productSlice";

const PAGE_SIZE = 12;

const NewArrivals = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const total = useAppSelector((state) => state.products.totalItems);
  const status = useAppSelector((state) => state.products.status);
  const totalPages = useAppSelector((state) => state.products.totalPages);
  const currentPage = useAppSelector((state) => state.products.filters.page ?? 0); // ← fix: watch filters.page
  useEffect(() => {
    dispatch(setPage(0));
  }, []);
  useEffect(() => {
    dispatch(fetchProducts({
      filters: {
        page: currentPage,
        pageSize: PAGE_SIZE,
        newArrival: true,
        marketVisible: [true],
        search: null,
        sortBy: "id",
        sortDir: "asc",
        brandIds: null,
        genres: null,
        categories: null,
        types: null,
        colors: null,
        size: null,
        minPrice: null,
        maxPrice: null,
      },
      search: null,
    }));
  }, [dispatch, currentPage]);

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
              Dernière Collection
            </p>
            <h1 className="font-heading font-black text-4xl md:text-6xl text-foreground">
              VIENT DE SORTIR
            </h1>
            <p className="text-muted-foreground font-body mt-3 max-w-md">
              Les sneakers les plus fraîches viennent d'arriver. Ne les ratez pas — elles ne dureront pas longtemps.
            </p>
          </div>
        </motion.div>

        <p className="text-muted-foreground text-sm mb-6">{total} nouveautés</p>

        {status === "loading" && <p className="text-muted-foreground">Chargement...</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {products.length === 0 && status !== "loading" && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">Aucune nouveauté disponible pour le moment.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => dispatch(setPage(currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Préc
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => dispatch(setPage(i))}
                className={`w-9 h-9 rounded-lg font-heading text-xs font-bold transition-colors ${
                  currentPage === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => dispatch(setPage(currentPage + 1))}
              disabled={currentPage === totalPages - 1}
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

export default NewArrivals;