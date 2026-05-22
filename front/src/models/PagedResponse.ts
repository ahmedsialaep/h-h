export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}