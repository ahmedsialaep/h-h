export interface CartItemDto {
  id: number | null;
  productId: number;
  productName: string;
  productPrice: number;
  productRef: string;
  productImage: string | null;
  brandName: string | null;
  variantId: number;
  variantSize: string;
  variantColor: string;
  quantity: number;
}
export interface CartItem {
  id?: number;
  productId: number;
  variantId: number;
  quantity: number;
}