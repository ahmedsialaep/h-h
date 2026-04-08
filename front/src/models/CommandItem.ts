import { Commande } from "./Commande";
import { Product } from "./Product";
import { ProductVars } from "./ProductVars";

export interface CommandItem {
  id: number;
  commande: Commande;
  product: Product;
  variant: ProductVars;
  quantity: number;
  unitPrice: number;
}
export interface CommandeItemDto {
  id: number;
  quantity: number;
  unitPrice: number;
  productId: number;
  productName: string;
  productRef:string;
  productImage: string | null;
  brandName: string | null;
  variantId: number;
  variantSize: string;
  variantColor: string;
}
export interface CommandeItemRequest {
  productId: number;
  variantId: number;
  quantity: number;
}