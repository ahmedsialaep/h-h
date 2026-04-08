import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchMagasin, createMagasin, updateMagasin } from "@/store/MagasinSlice";
import { useToast } from "@/hooks/use-toast";
import OpeningHoursPicker from "@/components/openingHourPicker";
import { Magasin } from "@/models/Magasin";


const emptyForm = {
  name: "",
  email: "",
  phone: "",
  adress: "",
  city: "",
  region: "",
  store_lat: "",
  store_lng: "",
  deliveryFee: 7,
  openingHours: "",
};

const AdminSettings = () => {
  const dispatch = useAppDispatch();
  const { magasin, status } = useAppSelector((state) => state.magasin);
  const { toast } = useToast();
  const [form, setForm] = useState<Omit<Magasin, "id">>(emptyForm);

  useEffect(() => {
    dispatch(fetchMagasin());
  }, [dispatch]);

  useEffect(() => {
    if (magasin) {
      setForm({
        name: magasin.name ?? "",
        email: magasin.email ?? "",
        phone: magasin.phone ?? "",
        adress: magasin.adress ?? "",
        city: magasin.city ?? "",
        region: magasin.region ?? "",
        store_lat: magasin.store_lat ?? "",
        store_lng: magasin.store_lng ?? "",
        deliveryFee: magasin.deliveryFee ?? 7,
        openingHours: magasin.openingHours ?? "",
      });
    }
  }, [magasin?.id]);

  const handleSave = async () => {
    try {
      if (magasin?.id) {
        await dispatch(updateMagasin({ id: magasin.id, data: form })).unwrap();
        toast({ title: "Magasin mis à jour", description: "Les modifications ont été enregistrées." });
      } else {
        await dispatch(createMagasin(form as Magasin)).unwrap();
        toast({ title: "Magasin créé", description: "Le magasin a été configuré avec succès." });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Configuration du magasin</p>
        {!magasin && status === "succeeded" && (
          <p className="text-xs text-primary font-heading mt-1">
            Aucun magasin configuré — remplissez les informations et enregistrez.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Store Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
            Informations du Magasin
          </h3>
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Nom du Magasin</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Téléphone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Adresse</label>
            <input
              value={form.adress}
              onChange={(e) => setForm({ ...form, adress: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Ville</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Région</label>
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Latitude</label>
              <input
                value={form.store_lat}
                onChange={(e) => setForm({ ...form, store_lat: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">Longitude</label>
              <input
                value={form.store_lng}
                onChange={(e) => setForm({ ...form, store_lng: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Hours */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
            Livraison & Horaires
          </h3>
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">
              Frais de Livraison (TND)
            </label>
            <input
              type="number"
              value={form.deliveryFee}
              onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            />
          </div>
          <OpeningHoursPicker
            value={form.openingHours}
            onChange={(val) => setForm({ ...form, openingHours: val })}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider px-8 py-3 rounded-lg hover:brightness-110 transition-all"
      >
        {magasin ? "Enregistrer les Modifications" : "Créer le Magasin"}
      </button>
    </div>
  );
};

export default AdminSettings;