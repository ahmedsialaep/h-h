import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProducts, setFilter, resetAndSetFilters, setPage } from "@/store/productSlice";
import { fetchBrands } from "@/store/brandSlice";
import { fetchTypes } from "@/store/TypeSlice";
import { Genre, Categorie } from "@/models/Product";
import { GENRE_LABELS, CATEGORIE_LABELS } from "@/models/constants/GenderConstant";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import EnhancedSelect from "@/components/admin/EnhancedSelect";
import ShopFilters from "@/components/ShopFilters";

const SORT_OPTIONS = [
  { value: "newest", label: "Plus Récents" },
  { value: "price-low", label: "Prix : Croissant" },
  { value: "price-high", label: "Prix : Décroissant" },
  { value: "popular", label: "Populaires" },
];

const SHOP_MARKET_VISIBLE = [true];

const Shop = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortValue, setSortValue] = useState("newest");
  const [searchInput, setSearchInput] = useState("");

  const products = useAppSelector((state) => state.products.items);
  const total = useAppSelector((state) => state.products.totalItems);
  const status = useAppSelector((state) => state.products.status);
  const filters = useAppSelector((state) => state.products.filters);
  const totalPages = useAppSelector((state) => state.products.totalPages);
  const brands = useAppSelector((state) => state.brands.items);
  const types = useAppSelector((state) => state.types.items);

  
  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchTypes());
    const genre = searchParams.get("genre") as Genre | null;
    const category = searchParams.get("category") as Categorie | null;
    dispatch(resetAndSetFilters({
      marketVisible: SHOP_MARKET_VISIBLE,
      ...(genre && { genres: [genre] }),
      ...(category && { categories: [category] }),
    }));
  }, []);

  
  useEffect(() => {
    const isSearching = !!filters.search;
    const timeout = setTimeout(() => {
      dispatch(fetchProducts({
        filters: { ...filters, marketVisible: SHOP_MARKET_VISIBLE, search: null },
        search: filters.search ?? null,
      }));
    }, isSearching ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [dispatch, filters]);

  const toggleGenre = (genre: Genre) => {
    const current = filters.genres ?? [];
    const updated = current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre];
    dispatch(setFilter({ genres: updated.length ? updated : null, page: 0 }));
  };

  const toggleCategorie = (category: Categorie) => {
    const current = filters.categories ?? [];
    const updated = current.includes(category) ? current.filter((c) => c !== category) : [...current, category];
    dispatch(setFilter({ categories: updated.length ? updated : null, page: 0 }));
  };

  const toggleBrand = (brandId: number) => {
    const current = filters.brandIds ?? [];
    const updated = current.includes(brandId) ? current.filter((b) => b !== brandId) : [...current, brandId];
    dispatch(setFilter({ brandIds: updated.length ? updated : null, page: 0 }));
  };

  const toggleType = (typeId: number) => {
    const current = filters.types ?? [];
    const updated = current.includes(typeId) ? current.filter((t) => t !== typeId) : [...current, typeId];
    dispatch(setFilter({ types: updated.length ? updated : null, page: 0 }));
  };

  const toggleSize = (size: string) => {
    const current = filters.size ?? [];
    const updated = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
    dispatch(setFilter({ size: updated.length ? updated : null, page: 0 }));
  };

  const handleSort = (value: string) => {
    setSortValue(value);
    switch (value) {
      case "price-low": dispatch(setFilter({ sortBy: "price", sortDir: "asc", page: 0 })); break;
      case "price-high": dispatch(setFilter({ sortBy: "price", sortDir: "desc", page: 0 })); break;
      case "popular": dispatch(setFilter({ sortBy: "averageRating", sortDir: "desc", page: 0 })); break;
      default: dispatch(setFilter({ sortBy: "id", sortDir: "asc", page: 0 })); break;
    }
  };

  const handleClearAll = () => {
    setSearchInput("");
    dispatch(resetAndSetFilters({ marketVisible: SHOP_MARKET_VISIBLE }));
  };

  const activeFilters = [
    ...(filters.genres ?? []).map((g) => ({ key: `genre-${g}`, label: GENRE_LABELS[g], clear: () => toggleGenre(g) })),
    ...(filters.categories ?? []).map((c) => ({ key: `cat-${c}`, label: CATEGORIE_LABELS[c], clear: () => toggleCategorie(c) })),
    ...(filters.brandIds ?? []).map((id) => ({ key: `brand-${id}`, label: brands.find((b) => b.id === id)?.brand_name || "", clear: () => toggleBrand(id) })),
    ...(filters.types ?? []).map((id) => ({ key: `type-${id}`, label: types.find((t) => t.id === id)?.type_name || "", clear: () => toggleType(id) })),
    ...(filters.size ?? []).map((s) => ({ key: `size-${s}`, label: `Taille ${s}`, clear: () => toggleSize(s) })),
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-heading text-primary font-bold text-xs uppercase tracking-[0.3em] mb-1">Collection</p>
            <h1 className="font-heading font-black text-3xl md:text-5xl text-foreground">TOUS LES PRODUITS</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center gap-2 text-muted-foreground font-heading text-sm uppercase tracking-wider"
            >
              <SlidersHorizontal size={16} /> Filtres
            </button>
            <EnhancedSelect
              label=""
              value={sortValue}
              options={SORT_OPTIONS}
              onChange={handleSort}
              className="w-48"
            />
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              
              const val = e.target.value.trim();
              dispatch(setFilter({ search: val || null, page: 0 }));
            }}
            placeholder="Rechercher un produit, une marque..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                dispatch(setFilter({ search: null, page: 0 }));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`${filtersOpen ? "block" : "hidden"} md:block w-full md:w-56 flex-shrink-0`}>
            <ShopFilters
              filters={filters}
              brands={brands}
              types={types}
              activeFilters={activeFilters}
              onToggleGenre={toggleGenre}
              onToggleCategorie={toggleCategorie}
              onToggleBrand={toggleBrand}
              onToggleType={toggleType}
              onToggleSize={toggleSize}
              onClearAll={handleClearAll}
            />
          </aside>

          {/* Products */}
          <div className="flex-1">
            <p className="text-muted-foreground text-sm mb-4">{total} produits</p>

            {status === "loading" && <Loading fullScreen size="lg" text="Chargement des produits..." />}

            {status !== "loading" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {products.length === 0 && (
                  <EmptyState
                    icon="search"
                    title="Aucun produit trouvé"
                    description="Aucun produit ne correspond à vos filtres. Essayez de modifier votre recherche."
                    action={{
                      label: "Réinitialiser les filtres",
                      href: "/shop",
                      onClick: handleClearAll,
                    }}
                  />
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => dispatch(setPage((filters.page ?? 0) - 1))}
                      disabled={!filters.page}
                      className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Préc
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => dispatch(setPage(i))}
                        className={`w-9 h-9 rounded-lg font-heading text-xs font-bold transition-colors ${
                          filters.page === i
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => dispatch(setPage((filters.page ?? 0) + 1))}
                      disabled={filters.page === totalPages - 1}
                      className="px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Suiv →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;