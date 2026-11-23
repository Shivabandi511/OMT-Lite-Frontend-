import api from './api';
import type { Vehicle, VehicleCreatePayload, VehicleUpdatePayload, VehicleStatus, RoutingDecision, Part } from '../types';

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

  /**
   * Fetch all inventory parts for a vehicle
   */
  async getParts(vehicleId: number | string): Promise<Part[]> {
    const res = await api.get<Part[]>(`/vehicles/${vehicleId}/parts`);
    return res.data;
  },

  /**
   * Update whether a part can be extracted or not
   */
  async updatePartExtraction(
    vehicleId: number | string,
    partId: number | string,
    canBeExtracted: boolean
  ): Promise<Part> {
    const res = await api.patch<Part>(`/vehicles/${vehicleId}/parts/${partId}/extraction`, { canBeExtracted });
    return res.data;
  },

  /**
   * Update part status (PENDING, EXTRACTED, MISSING, DAMAGED, SOLD)
   */
  async updatePartStatus(
    vehicleId: number | string,
    partId: number | string,
    status: string
  ): Promise<Part> {
    const res = await api.patch<Part>(`/vehicles/${vehicleId}/parts/${partId}/status`, { status });
    return res.data;
  },
};

export default vehicleService;
