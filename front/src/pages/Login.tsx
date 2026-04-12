import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { loginUser, clearSessionConflict, verify2FA, send2FA } from "@/store/authSlice";
import { mergeGuestCartOnLogin } from "@/store/CartSlice";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { loading, error, sessionConflict } = useAppSelector((state) => state.auth);

    const handleSubmit = async (e: React.FormEvent, force = false) => {
        e.preventDefault();

        try {
            const user = await dispatch(
                loginUser({ username: email, password, force })
            ).unwrap();



            toast({
                title: "Connexion réussie!",
                description: "Bienvenue sur Jumeaux Sports."
            });

            const ISADMIN = user.isAdmin;

            if (!user.verified2FA) {
                try {

                    await dispatch(send2FA());

                    // Now navigate to 2FA page
                    navigate("/2fa", { replace: true });
                } catch (err) {
                    console.error("Failed to send 2FA code:", err);
                    // Show error message to user
                }
            } else {
                if (ISADMIN) navigate("/admin", { replace: true });
                else navigate("/", { replace: true });
            }
            await dispatch(mergeGuestCartOnLogin());
            
        } catch (err: any) {
            if (err?.existingSession) {
                toast({
                    title: "Session active détectée",
                    description: `Session ${err.deviceType} déjà active.`,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Erreur",
                    description: err?.error || "Identifiants invalides",
                    variant: "destructive"
                });
            }
        }
    }


    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="font-heading font-black text-2xl tracking-tight text-foreground">
                        JUMEAUX<span className="text-primary"> SPORTS</span>
                    </Link>
                    <h1 className="font-heading font-bold text-3xl text-foreground mt-6">Connexion</h1>
                    <p className="text-muted-foreground mt-2">Connectez-vous à votre compte</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5">
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

                    {/* Session conflict — admin only */}
                    {sessionConflict && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-600">
                            <p className="font-semibold mb-1">Session active détectée</p>
                            <p className="text-xs mb-2">
                                Une session {sessionConflict.deviceType} est déjà active. Voulez-vous la remplacer?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        dispatch(clearSessionConflict());
                                        handleSubmit(e as any, true);
                                    }}
                                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded font-semibold"
                                >
                                    Oui, se connecter quand même
                                </button>
                                <button
                                    type="button"
                                    onClick={() => dispatch(clearSessionConflict())}
                                    className="text-xs border border-yellow-500/50 px-3 py-1 rounded"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Connexion..." : <><LogIn size={18} /> Se Connecter</>}
                    </button>

                    <p className="text-center text-muted-foreground text-sm">
                        Pas encore de compte ?{" "}
                        <Link to="/sign-up" className="text-primary font-semibold hover:underline">
                            S'inscrire
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
