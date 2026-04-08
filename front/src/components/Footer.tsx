import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { Categorie } from "@/models/Product";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="font-heading font-black text-xl text-foreground">
              JUMEAUX<span className="text-primary"> SPORTS</span>
            </Link>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Deux Esprits. Une Passion.<br />
              Votre destination pour le sportswear premium à Tunis.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={18} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest mb-4 text-foreground">Boutique</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/new-arrivals" className="text-muted-foreground text-sm hover:text-primary transition-colors">Nouveautés</Link>
              <Link to="/shop" className="text-muted-foreground text-sm hover:text-primary transition-colors">Tous les Produits</Link>
              <Link to={`/shop?category=${Categorie.RUNNING}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">Course</Link>
              <Link to={`/shop?category=${Categorie.BASKETBALL}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">Basketball</Link>
              <Link to={`/shop?category=${Categorie.FOOTBALL}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">Football</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest mb-4 text-foreground">Aide</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-muted-foreground text-sm">Guide des Tailles</span>
              <span className="text-muted-foreground text-sm">Infos Livraison</span>
              <span className="text-muted-foreground text-sm">Retours & Échanges</span>
              <span className="text-muted-foreground text-sm">Contactez-nous</span>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-widest mb-4 text-foreground">Notre Magasin</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jumeaux Sports Store<br />
              Tunis, Tunisie<br />
              Lun–Sam : 9h – 20h<br />
              Dim : 10h – 18h
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-text-dim text-xs">
            © 2026 Jumeaux Sports. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
