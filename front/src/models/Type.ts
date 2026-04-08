import { Product } from "./Product";

export interface Type {
  id: number;
  type_name: string;
  description?: string;
  product?: Product[];
}