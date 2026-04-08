
import { CartItem, CartItemDto } from "./CartItem";
import { User } from "./User";

export interface CartDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  userNom: string | null;
  userPrenom: string | null;
  username: string | null;
  cartItemDtos: CartItemDto[];
}


export interface Cart {
  id: number;
  createdAt: string;
  updatedAt: string;
  user: User | null;
  items: CartItem[];
}