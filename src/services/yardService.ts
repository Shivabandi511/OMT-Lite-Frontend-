import api from './api';
import type { Yard, YardCreatePayload, YardUpdatePayload, YardStatus } from '../types';

export const yardService = {
  /**
   * Fetch list of yards with optional search and status filtering
   */
  async getYards(params?: { search?: string; status?: YardStatus }): Promise<Yard[]> {
    const res = await api.get<Yard[]>('/yards', { params });
    return res.data;
  },

  /**
   * Fetch details of a single yard by ID
   */
  async getYardById(id: number | string): Promise<Yard> {
    const res = await api.get<Yard>(`/yards/${id}`);
    return res.data;
  },

  /**
   * Create a new yard (ADMIN and STAFF)
   */
  async createYard(payload: YardCreatePayload): Promise<Yard> {
    const res = await api.post<Yard>('/yards', payload);
    return res.data;
  },

  /**
   * Update existing yard details (ADMIN only)
   */
  async updateYard(id: number | string, payload: YardUpdatePayload): Promise<Yard> {
    const res = await api.put<Yard>(`/yards/${id}`, payload);
    return res.data;
  },

  /**
   * Update yard status (Activate/Deactivate - ADMIN only)
   */
  async updateYardStatus(id: number | string, status: YardStatus): Promise<Yard> {
    const res = await api.patch<Yard>(`/yards/${id}/status`, null, { params: { status } });
    return res.data;
  },
};

export default yardService;
