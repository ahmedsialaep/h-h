import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { COLORS } from "@/models/constants/ColorConstants";
import { SIZE_TYPE_OPTIONS, getSizesByType } from "@/models/constants/SizeConstants";

export interface VariantRow {
  id?: number;
  size: string | "";
  color: string;
  stock: number;
}

export const emptyVariant = (): VariantRow => ({ size: "", color: "", stock: 0 });

interface AdminVariantFormProps {
  variants: VariantRow[];
  sizeType: string;
  errors: string[];
  onSizeTypeChange: (type: string) => void;
  onVariantsChange: (variants: VariantRow[]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AdminVariantForm: React.FC<AdminVariantFormProps> = ({
  variants,
  sizeType,
  errors,
  onSizeTypeChange,
  onVariantsChange,
  onSubmit,
}) => {
  const addVariantRow = () => onVariantsChange([...variants, emptyVariant()]);

  const removeVariantRow = (index: number) =>
    onVariantsChange(variants.filter((_, i) => i !== index));

  const updateVariantRow = (index: number, field: keyof VariantRow, value: string | number) =>
    onVariantsChange(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg space-y-1">
          {errors.map((err, i) => <p key={i} className="text-destructive text-xs">{err}</p>)}
        </div>
      )}

      {/* Size type selector */}
      <div>
        <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
          Type de Taille
        </label>
        <div className="flex gap-2 flex-wrap">
          {SIZE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSizeTypeChange(opt.value);
                // ← keep ids when switching size type on existing variants
                onVariantsChange([emptyVariant()]);
              }}
              className={`px-3 py-1.5 rounded-lg font-heading text-xs uppercase tracking-wider transition-colors ${
                sizeType === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Variant rows */}
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_1fr_80px_36px] gap-2">
          <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">Taille</span>
          <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">Couleur</span>
          <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">Stock</span>
          <span />
        </div>

        {variants.map((v, i) => (
          <div key={v.id ?? i} className="grid grid-cols-[1fr_1fr_80px_36px] gap-2 items-center">

            {/* Size */}
            <div className="relative">
              <select
                value={v.size}
                onChange={(e) => updateVariantRow(i, "size",
                  sizeType === "CLOTHING" ? e.target.value : parseFloat(e.target.value)
                )}
                className="w-full appearance-none bg-background border border-border rounded-lg px-3 pr-7 py-2 text-sm text-foreground cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Taille</option>
                {getSizesByType(sizeType).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Color */}
            <div className="relative">
              <select
                value={v.color}
                onChange={(e) => updateVariantRow(i, "color", e.target.value)}
                className="w-full appearance-none bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="" disabled>Couleur</option>
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <div
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-border pointer-events-none"
                style={{ backgroundColor: COLORS.find((c) => c.value === v.color)?.hex ?? "#6B7280" }}
              />
            </div>

            {/* Stock */}
            <input
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => updateVariantRow(i, "stock", Number(e.target.value))}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            />

            <button
              type="button"
              onClick={() => removeVariantRow(i)}
              disabled={variants.length === 1}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addVariantRow}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={15} /> Ajouter une ligne
      </button>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider py-3 rounded-lg hover:brightness-110 transition-all"
      >
        Enregistrer les Variantes
      </button>
    </form>
  );
};

export default AdminVariantForm;