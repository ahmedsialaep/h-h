import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useToast } from "@/hooks/use-toast";
import { Magasin } from "@/models/Magasin";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchMagasin } from "@/store/MagasinSlice";
import Loading from "@/components/Loading";

const STORE_LAT = 36.819;
const STORE_LNG = 10.1658;

const About = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { magasin, status } = useAppSelector((state) => state.magasin);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchMagasin());
  }, [dispatch]);


  useEffect(() => {
    if (!mapRef.current) return;
    const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([STORE_LAT, STORE_LNG], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const icon = L.divIcon({
      className: "",
      html: `<div style="width:32px;height:32px;background:hsl(22,100%,50%);border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([STORE_LAT, STORE_LNG], { icon })
      .addTo(map)
      .bindPopup("<b>Jumeaux Sports</b><br>Tunis, Tunisie")
      .openPopup();

    return () => { map.remove(); };
  }, []);

  if (status === "loading") {
        return <Loading/>;
    }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <section className="container mx-auto px-4 md:px-6 mb-16 md:mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <p className="font-heading text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3">Notre Histoire</p>
            <h1 className="font-heading font-black text-4xl md:text-5xl text-foreground mb-6 leading-tight">
              DEUX ESPRITS.<br />UNE PASSION.
            </h1>
            <p className="text-muted-foreground font-body leading-relaxed mb-4">
              Née du lien entre deux frères — Hassen & Houssine — Jumeaux Sports a commencé comme un rêve à Tunis
              et est devenue la destination incontournable de la ville pour le sportswear authentique.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed">
              Ce qui a commencé dans un petit magasin est devenu un mouvement. Nous croyons que chacun mérite
              de ressentir la confiance que procure le port d'équipements sportifs premium. Du terrain à la rue,
              nous sélectionnons uniquement le meilleur des marques les plus emblématiques au monde.
            </p>
          </motion.div>

          {/* 30+ Years Experience Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 mt-8"
          >
            <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="font-heading font-black text-7xl md:text-9xl text-primary"
                >
                  30+
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-left"
                >
                  <p className="font-heading font-black text-2xl md:text-3xl text-foreground uppercase">Ans d'Expérience</p>
                  <p className="text-muted-foreground font-body text-sm md:text-base mt-1">Dans le sportswear authentique et premium</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      <section className="bg-secondary py-16 md:py-20 mb-16 md:mb-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-12">NOS VALEURS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Authenticité", desc: "100% de produits authentiques provenant de distributeurs agréés. Pas de contrefaçons, pas de compromis." },
              { title: "Qualité", desc: "Nous sélectionnons uniquement le meilleur sportswear qui répond à nos exigences élevées de performance et de style." },
              { title: "Communauté", desc: "Plus qu'un magasin — nous sommes un lieu de rassemblement pour les athlètes, les passionnés de sneakers et tous ceux qui vivent le style sportif." },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <h3 className="font-heading font-bold text-lg text-primary mb-3">{v.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6">
        <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground mb-6">NOUS TROUVER</h2>
        <div ref={mapRef} className="w-full h-80 rounded-xl overflow-hidden border border-border mb-4" />
        <div className="bg-card rounded-lg p-5 border border-border">
          <p className="font-heading font-bold text-foreground">{magasin?.name}</p>
          <p className="text-muted-foreground text-sm mt-1">{magasin?.city}, {magasin?.region}</p>
          <p className="text-muted-foreground text-sm">{magasin?.openingHours}</p>
          <p className="text-muted-foreground text-sm">+216 {magasin?.phone}</p>
        </div>
      </section>
    </div>
  );
};

export default About;
