import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { registerUser } from "@/store/authSlice";

const Signup = () => {
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { loading, error } = useAppSelector((state) => state.auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas.",
                variant: "destructive"
            });
            return;
        }

        const result = await dispatch(registerUser({
            nom,
            prenom,
            username: email,
            pwd: password
        }));

        if (registerUser.fulfilled.match(result)) {
            toast({
                title: "Compte créé!",
                description: "Bienvenue sur Jumeaux Sports. Connectez-vous."
            });
            navigate("/login");
        } else {
            toast({
                title: "Erreur",
                description: error || "Erreur lors de l'inscription",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="font-heading font-black text-2xl tracking-tight text-foreground">
                        JUMEAUX<span className="text-primary"> SPORTS</span>
                    </Link>
                    <h1 className="font-heading font-bold text-3xl text-foreground mt-6">Créer un Compte</h1>
                    <p className="text-muted-foreground mt-2">Rejoignez la communauté Jumeaux Sports</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5">
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
                                Nom
                            </label>
                            <input
                                type="text"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="Nom"
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
                                Prénom
                            </label>
                            <input
                                type="text"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                placeholder="Prénom"
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Création..." : <><UserPlus size={18} /> S'inscrire</>}
                    </button>

                    <p className="text-center text-muted-foreground text-sm">
                        Déjà un compte ?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;