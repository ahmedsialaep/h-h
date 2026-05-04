import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { verify2FA, send2FA } from "@/store/authSlice";

const TwoFactorAuth = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    
    // ← top level, not inside useState
    const user = useAppSelector((state) => state.auth.user);
    const email = user?.username ?? "";

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length < 6) {
            toast({
                title: "Erreur",
                description: "Veuillez entrer le code complet à 6 chiffres.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const verifiedUser = await dispatch(verify2FA({ verificationCode: otp })).unwrap();

            toast({
                title: "Vérification réussie!",
                description: "Votre identité a été confirmée."
            });

            
            const isAdmin = verifiedUser.isAdmin;
            if (isAdmin) {
                navigate("/admin", { replace: true });
            } else {
                navigate("/", { replace: true });
            }

        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error?.error || "Code invalide ou expiré",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await dispatch(send2FA()).unwrap();
            toast({
                title: "Code renvoyé",
                description: `Un nouveau code a été envoyé à ${email}.`
            });
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error?.message || "Impossible d'envoyer le code",
                variant: "destructive"
            });
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="font-heading font-black text-2xl tracking-tight text-foreground">
                        JUMEAUX<span className="text-primary"> SPORTS</span>
                    </Link>

                    <div className="mt-6 flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                    </div>

                    <h1 className="font-heading font-bold text-3xl text-foreground mt-4">
                        Vérification 2FA
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        Un code de vérification a été envoyé à <br />
                        <span className="font-semibold text-foreground">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="bg-card border border-border rounded-2xl p-8 space-y-6">

                    {/* OTP INPUT */}
                    <div>
                        <label className="block font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-3 text-center">
                            Code de vérification
                        </label>

                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>

                                <span className="mx-2 text-muted-foreground">-</span>

                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="block font-heading text-sm font-semibold uppercase tracking-wider text-foreground mb-2 text-center">
                            Adresse email
                        </label>

                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-muted-foreground text-center cursor-not-allowed"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Vérification..." : <><ShieldCheck size={18} /> Vérifier</>}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            className="w-full bg-secondary text-secondary-foreground font-heading font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {resending ? "Envoi..." : <><RefreshCw size={18} /> Renvoyer le code</>}
                        </button>
                    </div>
                </form>

                <p className="text-center text-muted-foreground text-xs mt-6">
                    Vous n'avez pas reçu de code ? Vérifiez votre dossier spam.
                </p>
            </div>
        </div>
    );
};

export default TwoFactorAuth;