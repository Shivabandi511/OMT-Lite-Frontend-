import api from './api';
import type { DashboardSummary } from '../types';

export const dashboardService = {
  /**
   * Fetch aggregated dashboard statistics
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await api.get<DashboardSummary>('/dashboard');
    return res.data;
  },
};

export default dashboardService;
