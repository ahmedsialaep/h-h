export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}