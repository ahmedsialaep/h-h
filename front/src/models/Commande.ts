// models/Commande.ts

import { CommandeItemDto, CommandeItemRequest, CommandItem } from "./CommandItem";
import { User } from "./User";

export enum DeliveryMethod {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}
export enum Status {
  EN_ATTENTE = "EN_ATTENTE",
  CONFIRMEE = "CONFIRMEE",
  EXPEDIEE = "EXPEDIEE",
  LIVREE = "LIVREE",
  PRETE_RETRAIT = "PRETE_RETRAIT",
  RECUPEREE = "RECUPEREE",
  ANNULEE = "ANNULEE",
}
export interface Commande {
  id: number;
  ref: string;
  status: Status;
  createdAt: string; 
  updatedAt?: string;

  // Delivery
  deliveryMethod: DeliveryMethod;
  adress?: string;
  city?: string;
  phone?: string;

  user?: User;

  // Items
  items: CommandItem[];

  totalPrice: number;
  deliveryFee: number;
  notes?: string;

  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
}
export interface CommandeFilterRequest {
  page: number;
  pageSize: number;
  userId: string | null;
  search: string | null;
  status: Status[] | null;
}


export interface CommandeDto {
  id: number;
  adress: string;
  city: string;
  ref: string;
  deliveryMethod: DeliveryMethod;
  notes: string;
  createdAt: string;
  status: Status;
  updatedAt: string;
  phone: string;
  totalPrice: number;
  deliveryFee: number;
  userId: string | null;
  username: string | null;
  userNom: string | null;
  userPrenom: string | null;
  guestFirstName: string | null;
  guestLastName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  items: CommandeItemDto[];
}
export interface CommandeRequest {
  adress?: string;
  city?: string;
  ref?: string;
  deliveryMethod: DeliveryMethod;
  notes?: string;
  phone?: string;
  totalPrice?: number;
  deliveryFee?: number;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  items?: CommandeItemRequest[];
}