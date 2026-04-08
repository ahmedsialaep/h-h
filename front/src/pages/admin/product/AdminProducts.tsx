import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProducts, setFilter, setPage, deleteProduct } from "@/store/productSlice";
import { Genre, ProductDTO } from "@/models/Product";
import { IMAGE_API_URL } from "@/config/config";
import ProductForm from "./AdminProductForm";
import { GENRE_LABELS } from "@/models/constants/GenderConstant";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import { fetchTypes } from "@/store/TypeSlice";
import MultiSelect from "@/components/admin/EnhancedMultiSelect";

const AdminProducts = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const filters = useAppSelector((state) => state.products.filters);
  const status = useAppSelector((state) => state.products.status);
  const totalPages = useAppSelector((state) => state.products.totalPages);
  const totalElements = useAppSelector((state) => state.products.totalItems);
  const types = useAppSelector((state) => state.types.items);


  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchProducts({
        filters,
        search: searchInput.trim() || null,
      }));
    }, searchInput ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [searchInput, filters]);
  useEffect(() => {
    dispatch(fetchTypes());
  }, [dispatch]);

  const handleEdit = (product: ProductDTO) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await dispatch(deleteProduct(id));
  };

  const handleGenderFilter = (genre: Genre | "all") => {
    dispatch(setFilter({ genres: genre === "all" ? null : [genre], page: 0 }));
  };
  const toggleType = (typeId: string) => {
    const id = Number(typeId);
    const current = filters.types ?? [];
    const updated = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];
    dispatch(setFilter({ types: updated.length ? updated : null, page: 0 }));
  };
  const handleMarketVisibleFilter = (val: boolean | "all") => {
    dispatch(setFilter({
      marketVisible: val === "all" ? null : [val],
      page: 0,
    }));
  };

  const isMarketVisibleActive = (val: boolean | "all") => {
    if (val === "all") return !filters.marketVisible?.length;
    return filters.marketVisible?.includes(val) ?? false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">Produits</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalElements} produits au total</p>
        </div>
        <button
          onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider px-5 py-2.5 rounded-lg hover:brightness-110 transition-all"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher un produit, une marque, une référence..."
          className="w-full bg-background border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
        />
        {searchInput && (
          <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Gender filters */}
        <button
          onClick={() => handleGenderFilter("all")}
          className={`px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider transition-colors ${!filters.genres?.length ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
        >
          Tous
        </button>
        {Object.values(Genre).map((g) => (
          <button
            key={g}
            onClick={() => handleGenderFilter(g)}
            className={`px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider transition-colors ${filters.genres?.includes(g) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
          >
            {GENRE_LABELS[g]}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Market visible filters */}
        {([
          { val: "all" as const, label: "Tous", icon: null },
          { val: true, label: "Visible", icon: <Eye size={13} /> },
          { val: false, label: "Masqué", icon: <EyeOff size={13} /> },
        ]).map(({ val, label, icon }) => (
          <button
            key={String(val)}
            onClick={() => handleMarketVisibleFilter(val)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-heading text-xs uppercase tracking-wider transition-colors ${isMarketVisibleActive(val) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
          >
            {icon}{label}
          </button>
        ))}
        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Type multi-select */}
        <MultiSelect
          label=""
          values={(filters.types ?? []).map(String)}
          options={types.map((t) => ({ value: String(t.id), label: t.type_name }))}
          onChange={(vals) =>
            dispatch(setFilter({ types: vals.length ? vals.map(Number) : null, page: 0 }))
          }
          placeholder="Type..."
          className="w-44"
        />
      </div>

      {showForm && (
        <ProductForm
          initialData={editingProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(undefined);
            dispatch(fetchProducts({ filters, search: searchInput.trim() || null }));
          }}
        />
      )}

      {/* Loading */}
      {status === "loading" && <Loading size="lg" text="Chargement des produits..." />}

      {/* Error */}
      {status === "failed" && (
        <p className="text-destructive text-sm">Erreur lors du chargement des produits.</p>
      )}

      {/* Empty state */}
      {status === "succeeded" && products.length === 0 && (
        <EmptyState
          icon="search"
          title="Aucun produit trouvé"
          description="Aucun produit ne correspond."

        />
      )}

      {/* Table */}
      {status !== "loading" && products.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">REF</th>
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">Produit</th>
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Genre</th>
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Catégorie</th>
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">Prix</th>
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Stock</th>
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Qte valable</th>
                  <th className="text-left p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Visible</th>
                  <th className="text-right p-4 font-heading text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">{product.ref}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image ? `${IMAGE_API_URL}/${encodeURIComponent(product.image)}` : "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg bg-secondary object-contain"
                        />
                        <div>
                          <p className="font-body font-semibold text-foreground">{product.name}</p>
                          <p className="text-muted-foreground text-xs">{product.brandName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
                        {GENRE_LABELS[product.gender]}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{product.categorie}</td>
                    <td className="p-4 font-heading font-bold text-foreground">{product.price} TND</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`font-heading font-bold text-sm ${(product.variants ?? []).reduce((acc, v) => acc + v.stock, 0) <= 5
                        ? "text-primary"
                        : "text-foreground"
                        }`}>
                        {(product.variants ?? []).reduce((acc, v) => acc + v.stock, 0)}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`font-heading font-bold text-sm ${(product.variants ?? []).reduce((acc, v) => acc + v.stock, 0) <= 5
                        ? "text-primary"
                        : "text-foreground"
                        }`}>
                        {(product.variants ?? []).reduce((acc, v) => acc + v.availableQuantity, 0)}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {product.marketVisible
                        ? <Eye size={15} className="text-green-500" />
                        : <EyeOff size={15} className="text-muted-foreground" />}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => dispatch(setPage(i))}
                  className={`w-8 h-8 rounded-lg font-heading text-xs font-bold transition-colors ${filters.page === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;