import { Brand } from "./Brand";
import { ProductVariantDTO, ProductVars } from "./ProductVars";
import { Type } from "./Type";

export interface ProductDTO {
  id: number;
  name: string;
  ref: string;
  gender: Genre;
  categorie: Categorie;
  price: number;
  originalPrice?: number;
  image?: string;
  createdAt: Date;
  brandId: number;
  brandName: string;

  typeId: number;
  typeName: string;

  variants: ProductVariantDTO[];

  description?: string;
  newArrival: boolean;
  marketVisible: boolean;
  averageRating: number;
}
export enum Genre {
  MALE = "MALE",
  FEMALE = "FEMALE",
  KIDS = "KIDS"
}
export enum Categorie {
  BASKETBALL = "BASKETBALL",
  FOOTBALL = "FOOTBALL",
  RUNNING = "RUNNING",
  LIFESTYLE = "LIFESTYLE"
}
export interface Product {
  id: number;
  name: string;
  ref: string;
  gender: Genre;
  categorie: Categorie;
  createdAt: Date;
  price: number;
  originalPrice?: number;

  image?: string;

  brand: Brand;
  productType: Type;

  variants: ProductVars[];

  description?: string;

  newArrival: boolean;
  marketVisible: boolean;
  averageRating: number;
}
export interface ProductFilters {
  brandIds?: number[] | null;
  genres?: Genre[] | null;
  categories?: Categorie[] | null;
  types?: number[] | null;
  colors?: string[] | null;
  size?: string[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  newArrival?: boolean | null;
  marketVisible?: boolean[] | null;
  search: string | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}

