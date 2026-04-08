import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchBrands, createBrand, updateBrand, deleteBrand, fetchBrandProductCounts } from "@/store/brandSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/models/Brand";
import { IMAGE_API_URL } from "@/config/config";

const AdminBrands = () => {
  const dispatch = useAppDispatch();
  const brands = useAppSelector((state) => state.brands.items);
  const status = useAppSelector((state) => state.brands.status);
  const products = useAppSelector((state) => state.products.items);
  const productCounts = useAppSelector((state) => state.brands.productCounts);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState<string | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  useEffect(() => {
  dispatch(fetchBrands()).unwrap();
  dispatch(fetchBrandProductCounts());
}, [dispatch]);
  const openAdd = () => {
    setEditingBrand(null);
    setBrandName("");
    setBrandImage(undefined);
    setImageFile(undefined);
    setDialogOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.brand_name);
    setBrandImage(brand.brand_img ? `${IMAGE_API_URL}/${encodeURIComponent(brand.brand_img)}` : undefined);
    setImageFile(undefined);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    setImageFile(file);
    setBrandImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const trimmed = brandName.trim();
    if (!trimmed) return;

    if (editingBrand) {
      await dispatch(updateBrand({
        brand: { ...editingBrand, brand_name: trimmed },
        image: imageFile,
      }));
      toast.success(`Marque "${trimmed}" mise à jour`);
    } else {
      await dispatch(createBrand({
        brand: { brand_name: trimmed, brand_img: undefined },
        image: imageFile,
      }));
      toast.success(`Marque "${trimmed}" ajoutée`);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (brand: Brand) => {
    await dispatch(deleteBrand(brand.id));
    setDeleteConfirm(null);
    toast.success(`Marque "${brand.brand_name}" supprimée`);
  };

  const getProductCount = (brandId: number) => productCounts[brandId] ?? 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-foreground">Marques</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez les marques de vos produits</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      {status === "loading" && <p className="text-muted-foreground text-sm">Chargement...</p>}
      {status === "failed" && <p className="text-destructive text-sm">Erreur lors du chargement.</p>}

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  {brand.brand_img ? (
                    <img
                      src={brand.brand_img ? `${IMAGE_API_URL}/${encodeURIComponent(brand.brand_img)}` : undefined}
                      alt={brand.brand_name}
                      className="w-10 h-10 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      <ImageIcon size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.brand_name}</TableCell>
                <TableCell>{getProductCount(brand.id)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(brand)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(brand)} className="text-destructive hover:text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {brands.length === 0 && status !== "loading" && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Aucune marque</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Modifier la Marque" : "Ajouter une Marque"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Nom de la marque"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Logo / Image</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {brandImage ? (
                <div className="relative group w-full">
                  <img src={brandImage} alt="Preview" className="w-full h-32 object-contain rounded-lg border border-border bg-muted p-2" />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={14} className="mr-1" /> Changer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setBrandImage(undefined)}>
                      <Trash2 size={14} className="mr-1" /> Retirer
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  <Upload size={20} />
                  <span className="text-sm">Cliquez pour ajouter une image</span>
                </button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!brandName.trim()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer "{deleteConfirm?.brand_name}" ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Cette marque contient {getProductCount(deleteConfirm?.id ?? 0)} produit(s). La suppression ne supprimera pas les produits.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBrands;