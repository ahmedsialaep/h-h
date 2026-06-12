import { useState } from "react";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hook";
import PageSkeleton from "../components/PageSkeleton";

const Profile = () => {
    const { toast } = useToast();
    const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

    const {user ,loading, restoringSession} = useAppSelector((state) => state.auth);

    const [form, setForm] = useState({
        nom: user?.nom ?? "",
        prenom: user?.prenom ?? "",
        email: user?.username ?? "",
        phone: "",
        address: "",
        city: "",
        zip: "",
    });

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!form.email.trim()) newErrors.email = "L'email est obligatoire.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email invalide.";
        if (!form.phone.trim()) newErrors.phone = "Le téléphone est obligatoire.";
        else if (!/^\+?[\d\s]{8,15}$/.test(form.phone)) newErrors.phone = "Numéro invalide.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        toast({ title: "Profil mis à jour", description: "Vos informations ont été sauvegardées." });
    };
    
    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground mb-8">
                    Mon Profil
                </h1>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary uppercase">
                                    {user?.prenom?.charAt(0) || user?.username?.charAt(0) || "U"}
                                </span>
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    {user?.prenom && user?.nom
                                        ? `${user.prenom} ${user.nom}`
                                        : user?.username}
                                </CardTitle>
                                <CardDescription>{user?.username}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prenom" className="flex items-center gap-2">
                                    <User size={14} /> Prénom
                                </Label>
                                <Input
                                    id="prenom"
                                    value={form.prenom}
                                    onChange={e => setForm({ ...form, prenom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nom" className="flex items-center gap-2">
                                    <User size={14} /> Nom
                                </Label>
                                <Input
                                    id="nom"
                                    value={form.nom}
                                    onChange={e => setForm({ ...form, nom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail size={14} /> Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => { setForm({ ...form, email: e.target.value }); setErrors(p => ({ ...p, email: undefined })); }}
                                    aria-invalid={!!errors.email}
                                    className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone size={14} /> Téléphone <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors(p => ({ ...p, phone: undefined })); }}
                                    placeholder="+216 XX XXX XXX"
                                    aria-invalid={!!errors.phone}
                                    className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip" className="flex items-center gap-2">
                                    <MapPin size={14} /> Code postal
                                </Label>
                                <Input
                                    id="zip"
                                    value={form.zip}
                                    onChange={e => setForm({ ...form, zip: e.target.value })}
                                    placeholder="1000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville</Label>
                                <Input
                                    id="city"
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    placeholder="Tunis"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Adresse</Label>
                            <Input
                                id="address"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                placeholder="123 Rue Example"
                            />
                        </div>

                        <Button onClick={handleSave} className="w-full gap-2">
                            <Save size={16} /> Sauvegarder
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;