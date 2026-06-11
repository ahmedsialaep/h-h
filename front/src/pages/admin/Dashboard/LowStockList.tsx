import { useState } from "react";
import { IMAGE_API_URL } from "@/config/config";

interface Props { products: any[]; }

const PAGE_SIZE = 6;

const LowStockList: React.FC<Props> = ({ products }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginated = products.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">⚠️ Stock Faible</h3>
        {products.length > 0 && (
          <span className="text-xs text-muted-foreground font-heading">{products.length} produits</span>
        )}
      </div>
      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm">Tous les produits sont bien approvisionnés.</p>
        ) : (
          <>
            {paginated.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image ? `${IMAGE_API_URL}/${encodeURIComponent(product.image)}` : "/placeholder.svg"}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg bg-secondary object-contain"
                  />
                  <div>
                    <p className="font-body font-semibold text-sm text-foreground">{product.name}</p>
                    <p className="text-muted-foreground text-xs">{product.brandName}</p>
                  </div>
                </div>
                <span className="text-primary font-heading font-bold text-sm">{product.totalStock ?? 0} restants</span>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-3 border-t border-border">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  ← Préc
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded-lg font-heading text-xs font-bold transition-colors ${page === i ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground hover:text-foreground"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages - 1}
                  className="px-3 py-1.5 rounded-lg font-heading text-xs uppercase tracking-wider border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Suiv →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LowStockList;