import { Categorie, Genre, Product, ProductDTO } from "@/models/Product";
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Brand } from "@/models/Brand";
import { Type } from "@/models/Type";
import { fetchBrands } from "@/store/brandSlice";
import { fetchTypes } from "@/store/TypeSlice";
import { useAppDispatch } from "@/store/hook";
import { createProduct, updateProduct, saveVariants } from "@/store/productSlice";
import { IMAGE_API_URL } from "@/config/config";
import { CATEGORIE_LABELS, GENRE_LABELS } from "@/models/constants/GenderConstant";
import EnhancedSelect from "@/components/admin/EnhancedSelect";
import AdminVariantForm, { VariantRow, emptyVariant } from "../product/AdminVariantForm";

interface ProductFormProps {
  initialData?: ProductDTO;
  onCancel: () => void;
}

type Step = "product" | "variants";

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onCancel }) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("product");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [savedProductId, setSavedProductId] = useState<number | null>(initialData?.id ?? null);
  const [errors, setErrors] = useState<string[]>([]);
  const [variantErrors, setVariantErrors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [sizeType, setSizeType] = useState("EU_ADULTS");
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [stockReductions, setStockReductions] = useState<string[]>([]);
  const [stockReductionConfirmed, setStockReductionConfirmed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    initialData?.image ? `${IMAGE_API_URL}/${initialData.image}` : undefined
  );
  const [form, setForm] = useState({
    ref: initialData?.ref || "",
    name: initialData?.name || "",
    categorie: initialData?.categorie || Categorie.BASKETBALL,
    gender: initialData?.gender || Genre.MALE,
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || 0,
    description: initialData?.description || "",
    newArrival: initialData?.newArrival || false,
    marketVisible: initialData?.marketVisible || false,
    brandId: initialData?.brandId || 0,
    typeId: initialData?.typeId || 0,
    image: initialData?.image || undefined,
  });

  const [variants, setVariants] = useState<VariantRow[]>(
    initialData?.variants?.map((v) => ({
      size: v.size ?? "",
      color: v.color ?? "",
      stock: v.stock,
    })) || [emptyVariant()]
  );

  useEffect(() => {
    dispatch(fetchBrands()).unwrap().then((data) => setBrands(data));
    dispatch(fetchTypes()).unwrap().then((data) => setTypes(data));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setForm({
        ref: initialData.ref || "",
        name: initialData.name || "",
        categorie: initialData.categorie || Categorie.BASKETBALL,
        gender: initialData.gender || Genre.MALE,
        price: initialData.price || 0,
        image: initialData.image || undefined,
        originalPrice: initialData.originalPrice || 0,
        description: initialData.description || "",
        newArrival: initialData.newArrival || false,
        marketVisible: initialData.marketVisible || false,
        brandId: initialData.brandId || 0,
        typeId: initialData.typeId || 0,
      });
      setVariants(
        initialData?.variants?.map((v) => ({
          id: v.id,
          size: v.size ?? "",
          color: v.color ?? "",
          stock: v.stock,
        })) || [emptyVariant()]
      );
      setImagePreview(initialData.image ? `${IMAGE_API_URL}/${initialData.image}` : undefined);
      setImageFile(undefined);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];
    if (!form.name.trim()) validationErrors.push("Le nom est obligatoire");
    if (!form.brandId) validationErrors.push("La Marque est obligatoire");
    if (!form.typeId) validationErrors.push("Le Type est obligatoire");
    if (!form.ref.trim()) validationErrors.push("La référence est obligatoire");
    if (form.price <= 0) validationErrors.push("Le prix doit être supérieur à 0");
    if (validationErrors.length > 0) { setErrors(validationErrors); return; }
    setErrors([]);

    const { brandId, typeId, ...rest } = form;
    const payload: Partial<Product> = {
      ...rest,
      brand: { id: brandId } as Brand,
      productType: { id: typeId } as Type,
      originalPrice: form.originalPrice > 0 ? form.originalPrice : undefined,
    };

    try {
      if (initialData?.id) {
        await dispatch(updateProduct({ id: initialData.id, data: payload, image: imageFile })).unwrap();
        setSavedProductId(initialData.id);

        setStep("variants");
      } else {
        const created = await dispatch(createProduct({ data: payload, image: imageFile })).unwrap();
        setSavedProductId(created.id);
        setStep("variants");
      }
    } catch (err: any) {
      setErrors([err.message || "Erreur lors de la sauvegarde du produit"]);
    }
  };
  const handleVariantsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVariantErrors([]);

    const validationErrors: string[] = [];
    variants.forEach((v, i) => {
      if (v.size === "") validationErrors.push(`Ligne ${i + 1}: taille requise`);
      if (!v.color.trim()) validationErrors.push(`Ligne ${i + 1}: couleur requise`);
      if (v.stock < 0) validationErrors.push(`Ligne ${i + 1}: stock invalide`);
    });
    if (validationErrors.length) { setVariantErrors(validationErrors); return; }

    // check for stock reductions on existing variants
    if (initialData?.variants) {
      const reductions: string[] = [];
      variants.forEach((v) => {
        if (!v.id) return;
        const original = initialData.variants!.find((ov) => ov.id === v.id);
        if (original && v.stock < original.stock) {
          const delta = original.stock - v.stock;
          reductions.push(
            `Taille ${v.size} / ${v.color}: stock réduit de ${original.stock} → ${v.stock} (−${delta})`
          );
        }
      });

      if (reductions.length > 0 && !stockReductionConfirmed) {
        setStockReductions(reductions);
        setShowStockWarning(true);
        return;
      }
    }

    await submitVariants();
  };
  const submitVariants = async () => {
    try {
      await dispatch(
        saveVariants({
          productId: savedProductId!,
          variants: variants.map((v) => ({
            id: v.id ?? null,
            size: String(v.size),
            color: v.color.trim(),
            stock: v.stock,
          })),
        })
      ).unwrap();
      onCancel();
    } catch (err: any) {
      setVariantErrors([err.message || "Erreur lors de la sauvegarde des variantes"]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {step === "variants" && (
              <button type="button" onClick={() => { setStep("product"); setVariantErrors([]); }}
                className="text-muted-foreground hover:text-foreground">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="font-heading font-bold text-lg text-foreground">
              {step === "product"
                ? initialData?.id ? `Modifier le Produit ${initialData.ref}` : "Nouveau Produit"
                : "Variantes du Produit"}
            </h2>
          </div>
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === "variants" ? "bg-primary" : "bg-border"}`} />
        </div>

        {/* Step 1 errors */}
        {step === "product" && errors.length > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg space-y-1">
            {errors.map((err, i) => <p key={i} className="text-destructive text-xs">{err}</p>)}
          </div>
        )}

        {/* ── STEP 1: Product ── */}
        {step === "product" && (
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Nom</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Référence</label>
                <input value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Image</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <div className="relative group w-full">
                  <img src={imagePreview} alt="preview"
                    className="w-full h-36 object-contain rounded-lg border border-border bg-muted p-2" />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-heading">
                      <Upload size={13} /> Changer
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                  <Upload size={18} />
                  <span className="text-xs">Cliquez pour ajouter une image</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <EnhancedSelect
                label="Marque"
                value={String(form.brandId)}
                options={[{ value: "0", label: "Sélectionner" }, ...brands.map((b) => ({ value: String(b.id), label: b.brand_name }))]}
                onChange={(val) => setForm({ ...form, brandId: Number(val) })}
                placeholder="Sélectionner une marque"
              />
              <EnhancedSelect
                label="Type"
                value={String(form.typeId)}
                options={[{ value: "0", label: "Sélectionner" }, ...types.map((t) => ({ value: String(t.id), label: t.type_name }))]}
                onChange={(val) => setForm({ ...form, typeId: Number(val) })}
                placeholder="Sélectionner un type"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <EnhancedSelect
                label="Catégorie"
                value={form.categorie}
                options={Object.values(Categorie).map((c) => ({ value: c, label: CATEGORIE_LABELS[c] }))}
                onChange={(val) => setForm({ ...form, categorie: val as Categorie })}
              />
              <EnhancedSelect
                label="Genre"
                value={form.gender}
                options={Object.values(Genre).map((g) => ({ value: g, label: GENRE_LABELS[g] }))}
                onChange={(val) => setForm({ ...form, gender: val as Genre })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Prix (TND)</label>
                <input type="number" value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Ancien Prix</label>
                <input type="number" value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.newArrival}
                onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} className="accent-primary" />
              <label className="text-sm text-muted-foreground">Marquer comme Nouveauté</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.marketVisible}
                onChange={(e) => setForm({ ...form, marketVisible: e.target.checked })} className="accent-primary" />
              <label className="text-sm text-muted-foreground">Marquer comme Visible</label>
            </div>
            <button type="submit"
              className="w-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider py-3 rounded-lg hover:brightness-110 transition-all">
              {initialData?.id ? "Enregistrer" : "Suivant → Variantes"}
            </button>
          </form>
        )}

        {/* ── STEP 2: Variants ── */}
        {step === "variants" && (
          <AdminVariantForm
            variants={variants}
            sizeType={sizeType}
            errors={variantErrors}
            onSizeTypeChange={setSizeType}
            onVariantsChange={setVariants}
            onSubmit={handleVariantsSubmit}

          />
        )}
      </div>
      {showStockWarning && (
        <div className="fixed inset-0 bg-background/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowStockWarning(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-foreground mb-2">⚠️ Réduction de Stock</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Les modifications suivantes vont réduire le stock. Des réservations actives pourraient être affectées:
            </p>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 space-y-1">
              {stockReductions.map((r, i) => (
                <p key={i} className="text-destructive text-xs font-mono">{r}</p>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStockWarning(false)}
                className="flex-1 border border-border rounded-lg py-2 text-sm font-heading text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  setShowStockWarning(false);
                  setStockReductionConfirmed(true);
                  await submitVariants();
                }}
                className="flex-1 bg-destructive text-destructive-foreground rounded-lg py-2 text-sm font-heading font-bold hover:brightness-110 transition-all"
              >
                Confirmer quand même
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;