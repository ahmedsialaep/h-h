import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import PageSkeleton from "../components/PageSkeleton";
import { fetchUserById, updateUser } from "../store/userSlice";
import { REGION_LABEL } from "../models/constants/LocalisationConstant";

const Profile = () => {
    const { toast } = useToast();
    const dispatch = useAppDispatch();
    const [errors, setErrors] = useState<{ username?: string; numTel?: string }>({});

    const authUser = useAppSelector((state) => state.auth.user);
    const { user, status } = useAppSelector((state) => state.user);

    useEffect(() => {
        if (authUser?.userId) {
            dispatch(fetchUserById(authUser.userId));
        }
    }, [dispatch, authUser?.userId]);

    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        username: "",
        pwd: "",
        numTel: "",
        CodePostal: "",
        ville: "",
        region: "",
    });

    // Populate form once user is fetched
    useEffect(() => {
        if (user) {
            setForm({
                nom: user.nom ?? "",
                prenom: user.prenom ?? "",
                username: user.username ?? "",
                pwd: "",
                numTel: user.numTel ?? "",
                CodePostal: user.CodePostal ? String(user.CodePostal) : "",
                ville: user.ville ?? "",
                region: user.region ?? "",
            });
        }
    }, [user]);

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!form.username.trim()) newErrors.username = "L'email est obligatoire.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username)) newErrors.username = "Email invalide.";
        if (!form.numTel.trim()) newErrors.numTel = "Le téléphone est obligatoire.";
        else if (!/^\+?[\d\s]{8,15}$/.test(form.numTel)) newErrors.numTel = "Numéro invalide.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            await dispatch(updateUser({
                ...user!,
                nom: form.nom,
                prenom: form.prenom,
                username: form.username,
                pwd: form.pwd || user!.pwd,
                numTel: form.numTel,
                CodePostal: form.CodePostal ? form.CodePostal : null,
                ville: form.ville,
                region: form.region,
            })).unwrap();
            toast({ title: "Profil mis à jour", description: "Vos informations ont été sauvegardées." });
        } catch (err: any) {
            toast({
                title: "Erreur",
                description: err.message ?? "Une erreur est survenue, Essayer plus tard",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground mb-8">
                    Mon Profil
                </h1>

                {status === "loading" ? (
                    <PageSkeleton variant="form" />
                ) : (
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
                                        value={form.username}
                                        onChange={e => { setForm({ ...form, username: e.target.value }); setErrors(p => ({ ...p, email: undefined })); }}
                                        aria-invalid={!!errors.username}
                                        className={errors.username ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.username && <p className="text-destructive text-xs">{errors.username}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock size={14} /> Mot de passe
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.pwd}
                                        onChange={e => { setForm({ ...form, pwd: e.target.value }); setErrors(p => ({ ...p, password: undefined })); }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numTel" className="flex items-center gap-2">
                                        <Phone size={14} /> Téléphone <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="numTel"
                                        value={form.numTel}
                                        onChange={e => { setForm({ ...form, numTel: e.target.value }); setErrors(p => ({ ...p, numTel: undefined })); }}
                                        placeholder="+216 XX XXX XXX"
                                        aria-invalid={!!errors.numTel}
                                        className={errors.numTel ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.numTel && <p className="text-destructive text-xs">{errors.numTel}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="CodePostal" className="flex items-center gap-2">
                                        <MapPin size={14} /> Code postal
                                    </Label>
                                    <Input
                                        id="CodePostal"
                                        value={form.CodePostal}
                                        onChange={e => setForm({ ...form, CodePostal: e.target.value })}
                                        placeholder="1000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ville">Ville</Label>
                                <Input
                                    id="ville"
                                    value={form.ville}
                                    onChange={e => setForm({ ...form, ville: e.target.value })}
                                    placeholder="Tunis"
                                />
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="region">Région</Label>
                                <select
                                    id="region"
                                    value={form.region}
                                    onChange={e => setForm({ ...form, region: e.target.value })}
                                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                >
                                    <option value="">Choisir une région</option>
                                    {REGION_LABEL.map(r => (
                                        <option key={r.name} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Button onClick={handleSave} className="w-full gap-2">
                                <Save size={16} /> Sauvegarder
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Profile;