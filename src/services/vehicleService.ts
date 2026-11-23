import api from './api';
import type { Vehicle, VehicleCreatePayload, VehicleUpdatePayload, VehicleStatus, RoutingDecision } from '../types';

export const vehicleService = {
  /**
   * Fetch list of vehicles with optional search and filters
   */
  async getVehicles(params?: {
    search?: string;
    yardId?: string | number;
    routingDecision?: RoutingDecision | '';
    status?: VehicleStatus | '';
  }): Promise<Vehicle[]> {
    const res = await api.get<Vehicle[]>('/vehicles', { params });
    return res.data;
  },

  /**
   * Fetch details of a single vehicle asset
   */
  async getVehicleById(id: number | string): Promise<Vehicle> {
    const res = await api.get<Vehicle>(`/vehicles/${id}`);
    return res.data;
  },

  /**
   * Register a new vehicle asset
   */
  async createVehicle(payload: VehicleCreatePayload): Promise<Vehicle> {
    const res = await api.post<Vehicle>('/vehicles', payload);
    return res.data;
  },

  /**
   * Update vehicle asset information
   */
  async updateVehicle(id: number | string, payload: VehicleUpdatePayload): Promise<Vehicle> {
    const res = await api.put<Vehicle>(`/vehicles/${id}`, payload);
    return res.data;
  },

  /**
   * Advance vehicle workflow status (RECEIVED -> IN_PROGRESS -> COMPLETED)
   */
  async advanceVehicleStatus(id: number | string, status: VehicleStatus): Promise<Vehicle> {
    const res = await api.patch<Vehicle>(`/vehicles/${id}/status`, null, { params: { status } });
    return res.data;
  },
};

export default vehicleService;
