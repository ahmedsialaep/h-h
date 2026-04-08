import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Truck } from "lucide-react";
import heroSneaker from "@/assets/sneaker-hero-1.png";
import ProductCard from "@/components/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchProducts } from "@/store/productSlice";
import { fetchBrands } from "@/store/brandSlice";

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.5 + i * 0.04, duration: 0.4 },
  }),
};

const Index = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const brands = useAppSelector((state) => state.brands.items);

  const headline = "ÉQUIPEZ-VOUS. DÉMARQUEZ-VOUS.";
  const newArrivals = products.slice(0, 4);

  useEffect(() => {
    dispatch(fetchProducts({
      page: 0,
      pageSize: 4,
      newArrival: true,
      sortBy: "id",
      sortDir: "asc",
    }));
    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-primary font-bold text-sm uppercase tracking-[0.3em] mb-4"
              >
                Deux Esprits. Une Passion.
              </motion.p>

              <h1 className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.9] mb-6 text-foreground">
                {headline.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={letterVariants}
                    className="inline-block"
                    style={{ whiteSpace: char === " " ? "pre" : undefined }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-muted-foreground font-body text-lg max-w-md mb-8"
              >
                Sportswear premium sélectionné pour les champions. Découvrez les dernières sorties des meilleures marques mondiales.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:brightness-110 transition-all glow-orange"
                >
                  Acheter Maintenant <ArrowRight size={18} />
                </Link>
                <Link
                  to="/new-arrivals"
                  className="inline-flex items-center gap-2 border border-border text-foreground font-heading font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:border-primary hover:text-primary transition-all"
                >
                  Nouveautés
                </Link>
              </motion.div>
            </div>

            <div className="order-1 md:order-2 flex justify-center">
              <motion.img
                src={heroSneaker}
                alt="Sneaker vedette"
                className="w-[300px] md:w-[500px] drop-shadow-2xl animate-float"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Marquee */}
      <section className="border-y border-border py-6 overflow-hidden">
        <div className="animate-marquee flex gap-16 whitespace-nowrap">
          {brands.length > 0
            ? [...brands, ...brands].map((brand, i) => (
                <span key={i} className="font-heading font-bold text-2xl text-muted-foreground/30 uppercase tracking-widest">
                  {brand.brand_name}
                </span>
              ))
            : Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="font-heading font-bold text-2xl text-muted-foreground/10 uppercase tracking-widest">
                  ●
                </span>
              ))}
        </div>
      </section>

      {/* 30+ Years Experience */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-xl p-8 md:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-heading font-black text-7xl md:text-9xl text-primary"
              >
                30+
              </motion.span>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-left"
              >
                <p className="font-heading font-black text-2xl md:text-4xl text-foreground uppercase">Ans d'Expérience</p>
                <p className="text-muted-foreground font-body text-base mt-1">Dans le sportswear authentique et premium</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gender Collections */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="font-heading text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">Collections</p>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-foreground">ACHETEZ PAR CATÉGORIE</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Homme", href: "/collection/homme", desc: "Performance & Style" },
              { label: "Femme", href: "/collection/femme", desc: "Élégance & Performance" },
              { label: "Enfant", href: "/collection/enfant", desc: "Confort & Durabilité" },
            ].map((col, i) => (
              <motion.div
                key={col.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link
                  to={col.href}
                  className="block relative bg-card border border-border rounded-xl p-8 md:p-10 text-center hover:border-primary transition-all group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <h3 className="font-heading font-black text-3xl md:text-4xl text-foreground mb-2 group-hover:text-primary transition-colors">{col.label}</h3>
                    <p className="text-muted-foreground text-sm font-body">{col.desc}</p>
                    <span className="inline-flex items-center gap-1 text-primary font-heading font-semibold text-sm uppercase tracking-wider mt-4">
                      Découvrir <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-heading text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">Dernières Sorties</p>
              <h2 className="font-heading font-black text-3xl md:text-4xl text-foreground">NOUVEAUTÉS</h2>
            </div>
            <Link to="/new-arrivals" className="text-primary font-heading font-semibold text-sm uppercase tracking-wider hover:underline flex items-center gap-1">
              Voir Tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 p-6 bg-card rounded-lg border border-border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1">Retrait Gratuit en Magasin</h3>
                <p className="text-muted-foreground text-sm">Commandez en ligne et récupérez gratuitement dans notre magasin à Tunis. Prêt en 24 heures.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 p-6 bg-card rounded-lg border border-border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-1">Livraison Nationale</h3>
                <p className="text-muted-foreground text-sm">Livraison rapide partout en Tunisie. Standard 2–5 jours ouvrables, express disponible.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-black text-4xl md:text-6xl text-foreground mb-6">
              PRÊT À<br /><span className="text-gradient-orange">PASSER AU NIVEAU SUPÉRIEUR ?</span>
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider px-10 py-4 rounded-lg hover:brightness-110 transition-all glow-orange"
            >
              Explorer la Collection <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;