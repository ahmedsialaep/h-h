import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hook";
import { fetchTypes, createType, updateType, deleteType } from "@/store/TypeSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Type } from "@/models/Type";

const AdminCategories = () => {
  const dispatch = useAppDispatch();

  const [types, setTypes] = useState<Type[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<Type | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Type | null>(null);

  useEffect(() => {
    dispatch(fetchTypes()).unwrap().then((data) => setTypes(data));
  }, [dispatch]);

  const openAdd = () => {
    setEditingType(null);
    setTypeName("");
    setTypeDescription("");
    setDialogOpen(true);
  };

  const openEdit = (type: Type) => {
    setEditingType(type);
    setTypeName(type.type_name);
    setTypeDescription(type.description || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const trimmed = typeName.trim();
    if (!trimmed) return;

    const payload = { type_name: trimmed, description: typeDescription.trim() };

    if (editingType) {
      const result = await dispatch(updateType({ id: editingType.id, data: payload })).unwrap();
      setTypes((prev) => prev.map((t) => (t.id === editingType.id ? result : t)));
      toast.success(`Type "${trimmed}" mis à jour`);
    } else {
      const result = await dispatch(createType(payload)).unwrap();
      setTypes((prev) => [...prev, result]);
      toast.success(`Type "${trimmed}" ajouté`);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (type: Type) => {
    await dispatch(deleteType(type.id));
    setTypes((prev) => prev.filter((t) => t.id !== type.id));
    setDeleteConfirm(null);
    toast.success(`Type "${type.type_name}" supprimé`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-foreground">Types</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez les types de produits</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.type_name}</TableCell>
                <TableCell className="text-muted-foreground">{type.description || "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(type)}>
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(type)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {types.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Aucun type
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "Modifier le Type" : "Ajouter un Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="Nom du type"
            />
            <Input
              value={typeDescription}
              onChange={(e) => setTypeDescription(e.target.value)}
              placeholder="Description"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!typeName.trim()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer "{deleteConfirm?.type_name}" ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;