import { Status, DeliveryMethod } from "@/models/Commande";

export const STATUS_LABELS: Record<Status, string> = {
  EN_ATTENTE: "En Attente",
  CONFIRMEE: "Confirmée",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  PRETE_RETRAIT: "Prête au Retrait",
  RECUPEREE: "Récupérée",
  ANNULEE: "Annulée",
};

export const STATUS_COLORS: Record<Status, string> = {
  EN_ATTENTE: "bg-yellow-500/10 text-yellow-500",
  CONFIRMEE: "bg-blue-500/10 text-blue-500",
  EXPEDIEE: "bg-purple-500/10 text-purple-500",
  LIVREE: "bg-green-500/10 text-green-500",
  PRETE_RETRAIT: "bg-green-500/10 text-green-500",
  RECUPEREE: "bg-green-800/10 text-green-800",
  ANNULEE: "bg-destructive/10 text-destructive",
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  PICKUP: "Retrait en magasin",
  DELIVERY: "Livraison",
};
export const ALL_STATUSES = Object.values(Status);

export const STATUS_BY_DELIVERY_METHOD: Record<DeliveryMethod, Status[]> = {
  DELIVERY: [
    Status.EN_ATTENTE,
    Status.CONFIRMEE,
    Status.EXPEDIEE,
    Status.LIVREE,
    Status.ANNULEE,
  ],
  PICKUP: [
    Status.EN_ATTENTE,
    Status.CONFIRMEE,
    Status.PRETE_RETRAIT,
    Status.RECUPEREE,
    Status.ANNULEE,
  ],
};