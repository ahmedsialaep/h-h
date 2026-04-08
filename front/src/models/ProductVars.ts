import { Product } from "./Product";

export interface ProductVars {
  id: number;
  product: Product;
  size?: string;
  color?: string;
  stock: number;
  soldQuantity: number;
  availableQuantity: number;
}

export interface ProductVariantDTO {
  id: number;
  productId: string;
  size?: string;
  color?: string;
  stock: number;
  soldQuantity: number;
  availableQuantity: number;
}