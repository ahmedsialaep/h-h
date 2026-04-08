import { useState } from "react";
import { MapPin, Truck, Check, User, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import OrderSummary from "@/components/OrderSummary";
import StoreInfo from "@/components/MagasinInfo";
import { REGION_LABEL } from "@/models/constants/LocalisationConstant";
import { clearCart } from "@/store/CartSlice";
import { CommandeRequest, DeliveryMethod } from "@/models/Commande";
import { CommandeItemRequest } from "@/models/CommandItem";
import { createCommande } from "@/store/CommandeSlice";

const steps = [
  { label: "Contact", icon: User },
  { label: "Livraison", icon: Truck },
];

const Checkout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const cart = useAppSelector((state) => state.cart.cart);
  const user = useAppSelector((state) => state.auth.user);
  const items = cart?.cartItemDtos ?? [];

  const [step, setStep] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [selectedWilaya, setSelectedWilaya] = useState(REGION_LABEL[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ← contact form
  const [firstName, setFirstName] = useState(user?.prenom ?? "");
  const [lastName, setLastName] = useState(user?.nom ?? "");
  const [email, setEmail] = useState(user?.username ?? "");
  const [phone, setPhone] = useState("");

  // ← delivery form
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const deliveryFee = deliveryMethod === "pickup" ? 0 : selectedWilaya.fee;
  const subtotal = items.reduce((acc, i) => acc + i.quantity * (i.productPrice ?? 0), 0);
  const total = subtotal + deliveryFee;

  const validatePhone = (value: string) =>
    /^\d{8}$/.test(value);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Prénom requis";
    if (!lastName.trim()) errs.lastName = "Nom requis";
    if (!user && !email.trim()) errs.email = "Email requis";
    if (!user && email.trim() && !validateEmail(email)) errs.email = "Email invalide";
    if (!phone.trim()) errs.phone = "Téléphone requis";
    if (phone.trim() && !validatePhone(phone)) errs.phone = "Le téléphone doit contenir exactement 8 chiffres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (deliveryMethod === "delivery") {
      if (!address.trim()) errs.address = "Adresse requise";
      if (!city.trim()) errs.city = "Ville requise";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep0()) setStep(1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const commandeItems: CommandeItemRequest[] = items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      }));

      const request: CommandeRequest = {
        deliveryMethod: deliveryMethod === "pickup" ? DeliveryMethod.PICKUP : DeliveryMethod.DELIVERY,
        adress: deliveryMethod === "delivery" ? address : undefined,
        city: deliveryMethod === "delivery" ? city : undefined,
        phone,
        notes,
        totalPrice: total,
        deliveryFee,
        ...(!user && {
          guestFirstName: firstName,
          guestLastName: lastName,
          guestEmail: email,
          guestPhone: phone,
          items: commandeItems,
        }),
        ...(user && { items: commandeItems }),
      };

      await dispatch(createCommande(request)).unwrap();
      dispatch(clearCart());
      toast({ title: "Commande confirmée !", description: "Votre commande a été passée avec succès." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erreur", description: err || "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ error }: { error?: string }) =>
    error ? <p className="text-destructive text-xs mt-1">{error}</p> : null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-muted-foreground font-body">Votre panier est vide.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mb-8">COMMANDE</h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/20 text-primary cursor-pointer"
                    : "bg-card text-muted-foreground"
                }`}
              >
                {i < step ? <Check size={14} /> : <s.icon size={14} />}
                {s.label}
              </button>
              {i < steps.length - 1 && <ChevronRight size={16} className="text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">

              {/* ── Step 0: Contact ── */}
              {step === 0 && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <h2 className="font-heading font-bold text-lg text-foreground mb-4">
                    Informations de Contact
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        placeholder="Prénom *"
                        value={firstName}
                        onChange={(e) => { setFirstName(e.target.value); setErrors({ ...errors, firstName: "" }); }}
                        className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.firstName ? "border-destructive" : "border-border"}`}
                      />
                      <Field error={errors.firstName} />
                    </div>
                    <div>
                      <input
                        placeholder="Nom *"
                        value={lastName}
                        onChange={(e) => { setLastName(e.target.value); setErrors({ ...errors, lastName: "" }); }}
                        className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.lastName ? "border-destructive" : "border-border"}`}
                      />
                      <Field error={errors.lastName} />
                    </div>
                  </div>

                  {!user && (
                    <div>
                      <input
                        placeholder="Email *"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }}
                        className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.email ? "border-destructive" : "border-border"}`}
                      />
                      <Field error={errors.email} />
                    </div>
                  )}

                  <div>
                    <input
                      placeholder="Téléphone * (8 chiffres)"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        
                        const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setPhone(val);
                        setErrors({ ...errors, phone: "" });
                      }}
                      maxLength={8}
                      className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.phone ? "border-destructive" : "border-border"}`}
                    />
                    <Field error={errors.phone} />
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider py-3.5 rounded-lg hover:brightness-110 transition-all mt-4"
                  >
                    Continuer vers la Livraison
                  </button>
                </motion.div>
              )}

              {/* ── Step 1: Delivery ── */}
              {step === 1 && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <h2 className="font-heading font-bold text-lg text-foreground mb-4">
                    Mode de Livraison
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setDeliveryMethod("pickup"); setErrors({}); }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        deliveryMethod === "pickup" ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <MapPin size={24} className={deliveryMethod === "pickup" ? "text-primary" : "text-muted-foreground"} />
                      <p className="font-heading font-bold text-sm text-foreground mt-2">Retrait en Magasin</p>
                      <p className="text-primary font-heading font-bold text-xs mt-1">GRATUIT</p>
                    </button>
                    <button
                      onClick={() => { setDeliveryMethod("delivery"); setErrors({}); }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        deliveryMethod === "delivery" ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <Truck size={24} className={deliveryMethod === "delivery" ? "text-primary" : "text-muted-foreground"} />
                      <p className="font-heading font-bold text-sm text-foreground mt-2">Livraison à Domicile</p>
                      <p className="text-muted-foreground text-xs mt-1">2–5 jours ouvrables</p>
                    </button>
                  </div>

                  {deliveryMethod === "pickup" ? (
                    <StoreInfo />
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <input
                          placeholder="Adresse *"
                          value={address}
                          onChange={(e) => { setAddress(e.target.value); setErrors({ ...errors, address: "" }); }}
                          className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.address ? "border-destructive" : "border-border"}`}
                        />
                        <Field error={errors.address} />
                      </div>
                      <div>
                        <input
                          placeholder="Ville *"
                          value={city}
                          onChange={(e) => { setCity(e.target.value); setErrors({ ...errors, city: "" }); }}
                          className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary ${errors.city ? "border-destructive" : "border-border"}`}
                        />
                        <Field error={errors.city} />
                      </div>
                      <select
                        value={selectedWilaya.name}
                        onChange={(e) => setSelectedWilaya(REGION_LABEL.find((w) => w.name === e.target.value) || REGION_LABEL[0])}
                        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary"
                      >
                        {REGION_LABEL.map((w) => (
                          <option key={w.name} value={w.name}>
                            {w.name} — {w.fee} TND livraison
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <textarea
                    placeholder="Notes (optionnel)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider py-3.5 rounded-lg hover:brightness-110 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed glow-orange"
                  >
                    {loading ? "Traitement..." : `Passer la Commande — ${total.toFixed(2)} TND`}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <OrderSummary deliveryFee={deliveryFee} />
        </div>
      </div>
    </div>
  );
};

export default Checkout;