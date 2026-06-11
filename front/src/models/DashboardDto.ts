export interface DashboardSummaryDto {
  WeekTotalRevenue: number;
  WeekTotalOrders: number;
  todayWaitingOrders: number;
  lowStockCount: number;
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  orders: number;
  profit: number;
  profitRate: number;
  revenueRate: number;
}

export interface CategorieSales {
  CategorieName: string;
  value: number;
  rate: number;
}

export interface DashboardDto {
  summary: DashboardSummaryDto;
  monthlyStats: MonthlyStats[];
  categoryStats: CategorieSales[];
}