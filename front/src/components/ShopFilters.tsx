import { useState } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Genre, Categorie } from "@/models/Product";
import { CATEGORIE_LABELS, GENRE_LABELS } from "@/models/constants/GenderConstant";
import { CLOTHING_SIZES, EU_SIZES_ALL } from "@/models/constants/SizeConstants";
import { Brand } from "@/models/Brand";
import { Type } from "@/models/Type";

// ── FilterItem ─────────────────────────────────────────────────────────────
const FilterItem = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className={cn(
      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
      checked
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    <span
      className={cn(
        "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
        checked ? "border-primary bg-primary" : "border-muted-foreground/30 bg-background"
      )}
    >
      {checked && <Check size={10} className="text-primary-foreground" />}
    </span>
    <span className="truncate">{label}</span>
  </button>
);

// ── FilterSection ──────────────────────────────────────────────────────────
const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/50 transition-colors"
      >
        <span className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
          {title}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={cn("text-muted-foreground transition-transform", open && "rotate-180")}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="px-2 py-2 space-y-0.5 bg-card border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
};

// ── ShopFilters ────────────────────────────────────────────────────────────
export interface ActiveFilter {
  key: string;
  label: string;
  clear: () => void;
}

interface ShopFiltersProps {
  filters: {
    genres?: Genre[] | null;
    categories?: Categorie[] | null;
    brandIds?: number[] | null;
    types?: number[] | null;
    size?: string[] | null;
  };
  brands: Brand[];
  types: Type[];
  activeFilters: ActiveFilter[];
  onToggleGenre: (g: Genre) => void;
  onToggleCategorie: (c: Categorie) => void;
  onToggleBrand: (id: number) => void;
  onToggleType: (id: number) => void;
  onToggleSize: (s: string) => void;
  onClearAll: () => void;
}

const ShopFilters = ({
  filters,
  brands,
  types,
  activeFilters,
  onToggleGenre,
  onToggleCategorie,
  onToggleBrand,
  onToggleType,
  onToggleSize,
  onClearAll,
}: ShopFiltersProps) => {
  return (
    <div className="space-y-3">
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-1">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={f.clear}
              className="flex items-center gap-1 bg-primary/10 text-primary font-heading text-xs uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
            >
              {f.label} <X size={12} />
            </button>
          ))}
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 bg-destructive/10 text-destructive font-heading text-xs uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-destructive/20 transition-colors"
          >
            Tout effacer <X size={12} />
          </button>
        </div>
      )}

      <FilterSection title="Genre">
        {Object.values(Genre).map((g) => (
          <FilterItem
            key={g}
            label={GENRE_LABELS[g]}
            checked={filters.genres?.includes(g) ?? false}
            onChange={() => onToggleGenre(g)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Catégorie">
        {Object.values(Categorie).map((c) => (
          <FilterItem
            key={c}
            label={CATEGORIE_LABELS[c]}
            checked={filters.categories?.includes(c) ?? false}
            onChange={() => onToggleCategorie(c)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Marque">
        {brands.map((brand) => (
          <FilterItem
            key={brand.id}
            label={brand.brand_name}
            checked={filters.brandIds?.includes(brand.id) ?? false}
            onChange={() => onToggleBrand(brand.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Type">
        {types.map((t) => (
          <FilterItem
            key={t.id}
            label={t.type_name}
            checked={filters.types?.includes(t.id) ?? false}
            onChange={() => onToggleType(t.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Taille">
        <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/50 px-3 pt-1 pb-0.5">EU</p>
        {EU_SIZES_ALL.map((s) => (
          <FilterItem
            key={s}
            label={String(s)}
            checked={filters.size?.includes(String(s)) ?? false}
            onChange={() => onToggleSize(String(s))}
          />
        ))}
        <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/50 px-3 pt-2 pb-0.5">Vêtements</p>
        {CLOTHING_SIZES.map((s) => (
          <FilterItem
            key={s}
            label={s}
            checked={filters.size?.includes(s) ?? false}
            onChange={() => onToggleSize(s)}
          />
        ))}
      </FilterSection>
    </div>
  );
};

export default ShopFilters;